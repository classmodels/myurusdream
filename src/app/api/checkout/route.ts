import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { generateReferralCode, nextParticipantNumber } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { flagFraud, looksSuspiciousEmail } from "@/lib/fraud";
import { LEGAL_DOC_VERSION } from "@/lib/constants";
import { parseRefCookie } from "@/lib/referral";
import { attachReferral } from "@/lib/referral-attach";
import { isLikelyPhone, normalizePhone } from "@/lib/phone";
import { contributionCheckoutResponse, createContributionPayment } from "@/lib/contribution-checkout";
import { getSessionUser } from "@/lib/auth";

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
  let refCode =
    parsed.data.referralCode?.trim() || parseRefCookie(req.headers.get("cookie")) || "";

  // Eigen link-cookie telt niet als uitnodiging (typisch bij testen op hetzelfde toestel).
  const sessionUser = await getSessionUser("participant");
  if (sessionUser?.referralCode && refCode === sessionUser.referralCode) {
    refCode = "";
  }

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
    await attachReferral({
      userId: user.id,
      email,
      phoneNormalized,
      refCode,
      payerIp: ip,
    });
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
    referralCode: refCode || null,
  });

  return contributionCheckoutResponse(payment);
}
