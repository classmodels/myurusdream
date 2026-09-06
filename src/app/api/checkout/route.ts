import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { generateReferralCode, nextParticipantNumber } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkSelfReferral, flagFraud, looksSuspiciousEmail } from "@/lib/fraud";
import { LEGAL_DOC_VERSION } from "@/lib/constants";
import { parseRefCookie } from "@/lib/referral";
import { isLikelyPhone, normalizePhone } from "@/lib/phone";
import { contributionCheckoutResponse, createContributionPayment } from "@/lib/contribution-checkout";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(24)
    .regex(/^[+\d][\d\s./-]{7,23}$/),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptCampaign: z.literal(true),
  referralCode: z.string().max(32).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`checkout:${ip}`, 20, 10 * 60 * 1000);
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
      { error: "Controleer voornaam, naam, e-mail, gsm en de verplichte vinkjes." },
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
  const lastName = parsed.data.lastName.trim();
  const phone = parsed.data.phone.trim();
  const phoneNormalized = normalizePhone(phone);
  const refCode =
    parsed.data.referralCode?.trim() || parseRefCookie(req.headers.get("cookie"));

  if (!isLikelyPhone(phoneNormalized)) {
    return NextResponse.json({ error: "Vul een geldig gsm-nummer in." }, { status: 400 });
  }

  if (looksSuspiciousEmail(email)) {
    await flagFraud({ type: "email_pattern", details: email });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        phoneNormalized,
        participantNumber: await nextParticipantNumber(),
        referralCode: generateReferralCode(),
        lastIp: ip,
      },
    }));

  if (existing) {
    await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName, phone, phoneNormalized, lastIp: ip },
    });
  }

  if (refCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } });
    if (referrer) {
      const self = await checkSelfReferral(referrer.id, email, phoneNormalized);
      const already = await prisma.referral.findUnique({ where: { referredUserId: user.id } });
      const referrerPaid = await prisma.payment.findFirst({
        where: { userId: referrer.id, status: "paid", kind: "contribution" },
      });
      if (self) {
        await flagFraud({
          type: "self_referral",
          details: "Poging tot self-referral bij checkout.",
          userId: user.id,
        });
      } else if (!referrerPaid) {
        await flagFraud({
          type: "unpaid_referrer",
          details: "Link van iemand zonder bevestigde €2 genegeerd.",
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

  const alreadyLegal = await prisma.legalAcceptance.findFirst({
    where: { userId: user.id, document: "terms", version: LEGAL_DOC_VERSION },
  });
  if (!alreadyLegal) {
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
  }

  const payment = await createContributionPayment({
    userId: user.id,
    campaignId: campaign.id,
    amountCents: campaign.contributionCents,
    ip,
    userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
  });

  return contributionCheckoutResponse(payment);
}
