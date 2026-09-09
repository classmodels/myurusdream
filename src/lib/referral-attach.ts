import { prisma } from "./prisma";
import { flagFraud } from "./fraud";
import { isSelfReferral } from "./referral-rules";
import { normalizeReferralCode } from "./referral";
import { isRoutablePublicIp } from "./phone";

function samePublicIp(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b || a !== b) return false;
  return isRoutablePublicIp(a);
}

export async function attachReferral(input: {
  userId: string;
  email: string;
  phoneNormalized?: string | null;
  refCode?: string | null;
  payerIp?: string | null;
}) {
  const code = normalizeReferralCode(input.refCode);
  if (!code) return null;

  const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
  if (!referrer) return null;

  if (isSelfReferral(referrer, { id: input.userId, email: input.email })) {
    await flagFraud({
      type: "self_referral",
      details: "Poging tot self-referral bij checkout.",
      userId: input.userId,
    });
    return null;
  }

  const already = await prisma.referral.findUnique({ where: { referredUserId: input.userId } });
  if (already) return already;

  const referrerPaid = await prisma.payment.findFirst({
    where: { userId: referrer.id, status: "paid", kind: "contribution" },
    select: { id: true, ipAddress: true },
    orderBy: { paidAt: "desc" },
  });
  if (!referrerPaid) {
    await flagFraud({
      type: "unpaid_referrer",
      details: "Link van iemand zonder bevestigde €2 genegeerd.",
      userId: input.userId,
    });
    return null;
  }

  // Zelfde netwerk/toestel als de doorstuurder → geen referral (voorkomt valse “via u”-meldingen bij testen).
  if (
    samePublicIp(input.payerIp, referrerPaid.ipAddress) ||
    samePublicIp(input.payerIp, referrer.lastIp)
  ) {
    await flagFraud({
      type: "same_ip_referral",
      details: "Zelfde IP als de doorstuurder — geen referralpunten.",
      userId: input.userId,
    });
    return null;
  }

  if (input.phoneNormalized && referrer.phoneNormalized && input.phoneNormalized === referrer.phoneNormalized) {
    await flagFraud({
      type: "same_phone_referral",
      details: "Zelfde gsm als de doorstuurder — geen referralpunten.",
      userId: input.userId,
    });
    return null;
  }

  return prisma.referral.create({
    data: {
      referrerId: referrer.id,
      referredUserId: input.userId,
      referralCode: code,
      source: "checkout",
      fraudStatus: "clean",
    },
  });
}

export async function loadShareLineage(directReferrerId: string, payerId: string) {
  const lineage: { referrerId: string; paid: boolean }[] = [];
  const visited = new Set([payerId, directReferrerId]);
  let currentId = directReferrerId;
  while (true) {
    const parent = await prisma.referral.findUnique({
      where: { referredUserId: currentId },
    });
    if (!parent) break;
    if (visited.has(parent.referrerId)) break;
    visited.add(parent.referrerId);
    const ancestorPaid = await prisma.payment.findFirst({
      where: { userId: parent.referrerId, status: "paid", kind: "contribution" },
      select: { id: true },
    });
    lineage.push({ referrerId: parent.referrerId, paid: Boolean(ancestorPaid) });
    if (!ancestorPaid) break;
    currentId = parent.referrerId;
  }
  return lineage;
}
