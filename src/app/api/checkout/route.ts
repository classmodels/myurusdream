import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { generateReferralCode, nextParticipantNumber } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkSelfReferral, flagFraud, looksSuspiciousEmail, tooManyFromIp } from "@/lib/fraud";
import { getMollie, mollieConfigured, siteUrl } from "@/lib/mollie";
import { LEGAL_DOC_VERSION } from "@/lib/constants";
import { audit } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional().or(z.literal("")),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptCampaign: z.literal(true),
  referralCode: z.string().max(32).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Controleer e-mail, voornaam en de verplichte vinkjes." },
      { status: 400 },
    );
  }

  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const firstName = parsed.data.firstName.trim();
  const lastName = parsed.data.lastName?.trim() || null;
  const refCode = parsed.data.referralCode?.trim() || "";

  if (tooManyFromIp(ip)) {
    await flagFraud({
      type: "mass_ip",
      details: `Veel checkoutpogingen vanaf ${ip}`,
    });
  }
  if (looksSuspiciousEmail(email)) {
    await flagFraud({ type: "email_pattern", details: email });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { payments: { where: { status: "paid" }, take: 1 } },
  });
  if (existing?.payments.length) {
    return NextResponse.json(
      { error: "Dit e-mailadres deed al mee met een bevestigde bijdrage van €2." },
      { status: 409 },
    );
  }

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        participantNumber: await nextParticipantNumber(),
        referralCode: generateReferralCode(),
        lastIp: ip,
      },
    }));

  if (existing) {
    await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, lastIp: ip },
    });
  }

  if (refCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
    if (referrer) {
      const self = await checkSelfReferral(referrer.id, email);
      const already = await prisma.referral.findUnique({ where: { referredUserId: user.id } });
      if (self) {
        await flagFraud({
          type: "self_referral",
          details: "Poging tot self-referral bij checkout.",
          userId: user.id,
        });
      } else if (!already) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredUserId: user.id,
            referralCode: refCode,
            source: "checkout",
            fraudStatus: "clean",
          },
        });
      }
    }
  }

  for (const document of ["terms", "privacy", "campaign"] as const) {
    await prisma.legalAcceptance.create({
      data: {
        userId: user.id,
        document,
        version: LEGAL_DOC_VERSION,
        ip,
      },
    });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      campaignId: campaign.id,
      amountCents: campaign.contributionCents,
      status: "pending",
      ipAddress: ip,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
    },
  });

  await audit({
    actorId: user.id,
    action: "checkout.started",
    entity: "Payment",
    entityId: payment.id,
    ip,
  });

  if (!mollieConfigured()) {
    return NextResponse.json({
      paymentId: payment.id,
      simulate: true,
      notice: "Testmodus: Mollie-sleutel ontbreekt. U kunt lokaal een betaling simuleren.",
    });
  }

  try {
    const mollie = getMollie();
    const webhook = process.env.MOLLIE_WEBHOOK_URL?.trim();
    const created = await mollie.payments.create({
      amount: { currency: "EUR", value: (campaign.contributionCents / 100).toFixed(2) },
      description: `DroomOp2 — eenmalige bijdrage €2`,
      redirectUrl: `${siteUrl()}/bedankt?pid=${payment.id}`,
      webhookUrl: webhook || `${siteUrl()}/api/webhooks/mollie`,
      metadata: { paymentId: payment.id, userId: user.id },
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mollieId: created.id },
    });
    const checkoutUrl = created.getCheckoutUrl();
    return NextResponse.json({ paymentId: payment.id, checkoutUrl, simulate: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mollie-fout";
    return NextResponse.json(
      { error: `Betaling starten mislukt: ${message}` },
      { status: 502 },
    );
  }
}
