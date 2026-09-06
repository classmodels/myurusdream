import { createHash } from "crypto";
import { prisma } from "./prisma";
import { generateEntryNumber } from "./auth";
import { flagFraud } from "./fraud";
import { multiLevelEnabled } from "./flags";
import { audit } from "./audit";
import { isRoutablePublicIp } from "./phone";
import { notifyUser } from "./notify";
import { POINTS } from "./constants";

function samePublicIp(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b || a !== b) return false;
  return isRoutablePublicIp(a);
}

async function awardLineagePoints(input: {
  paidUserId: string;
  directReferrerId: string;
  paymentId: string;
  amount: number;
  payerIp: string | null;
}) {
  const visited = new Set<string>([input.paidUserId, input.directReferrerId]);
  let currentId = input.directReferrerId;
  while (true) {
    const parent = await prisma.referral.findUnique({
      where: { referredUserId: currentId },
    });
    if (!parent?.verifiedPayment) break;
    if (visited.has(parent.referrerId)) break;
    visited.add(parent.referrerId);

    const ancestorPaid = await prisma.payment.findFirst({
      where: { userId: parent.referrerId, status: "paid", kind: "contribution" },
      orderBy: { paidAt: "desc" },
    });
    if (!ancestorPaid) break;

    if (samePublicIp(input.payerIp, ancestorPaid.ipAddress)) {
      await flagFraud({
        type: "same_ip_lineage",
        details: "Geen lijn-punt: zelfde publiek IP als een eerdere schakel.",
        userId: parent.referrerId,
        paymentId: input.paymentId,
        referralId: parent.id,
      });
      currentId = parent.referrerId;
      continue;
    }

    await prisma.pointsTransaction.create({
      data: {
        userId: parent.referrerId,
        amount: input.amount,
        reason: "Verdere storting in uw lijn",
        source: "further_level",
        paymentId: input.paymentId,
        referralId: parent.id,
      },
    });
    await notifyUser({
      userId: parent.referrerId,
      title: "Nieuwe punten",
      body: `+${input.amount} punten: iemand in uw lijn heeft gestort.`,
      url: "/dashboard",
    });
    currentId = parent.referrerId;
  }
}

export async function fulfillPaidPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true, campaign: true },
  });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "paid") return payment;

  const paid = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "paid", paidAt: new Date() },
    include: { user: true, campaign: true },
  });

  const isContribution = paid.kind === "contribution";

  const existingEntry = await prisma.prizeEntry.findFirst({
    where: { paymentId: paid.id },
  });
  if (isContribution && !existingEntry) {
    await prisma.prizeEntry.create({
      data: {
        userId: paid.userId,
        paymentId: paid.id,
        entryNumber: generateEntryNumber(),
        valid: true,
      },
    });
  }

  const ownPoints = paid.campaign.pointsOwnContribution || POINTS.own;
  const alreadyOwn = await prisma.pointsTransaction.findFirst({
    where: { paymentId: paid.id, source: "own_contribution" },
  });
  if (isContribution && !alreadyOwn && ownPoints > 0) {
    await prisma.pointsTransaction.create({
      data: {
        userId: paid.userId,
        amount: ownPoints,
        reason: "Eigen bevestigde bijdrage",
        source: "own_contribution",
        paymentId: paid.id,
      },
    });
    await notifyUser({
      userId: paid.userId,
      title: "Storting bevestigd",
      body: `Uw €2 is binnen. +${ownPoints} punten staan op uw dashboard.`,
      url: "/dashboard",
    });
  }

  const referral = await prisma.referral.findUnique({
    where: { referredUserId: paid.userId },
  });
  if (isContribution && referral && referral.fraudStatus !== "blocked") {
    const referrerPaid = await prisma.payment.findFirst({
      where: { userId: referral.referrerId, status: "paid", kind: "contribution" },
      orderBy: { paidAt: "desc" },
    });
    const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId } });
    const self =
      referral.referrerId === paid.userId ||
      referrer?.email.toLowerCase() === paid.user.email.toLowerCase();

    if (self || !referrerPaid) {
      if (!referral.verifiedPayment) {
        await prisma.referral.update({
          where: { id: referral.id },
          data: { fraudStatus: "blocked", verifiedPayment: false },
        });
      }
      await flagFraud({
        type: self ? "self_referral" : "unpaid_referrer",
        details: self
          ? "Self-referral geblokkeerd bij betalingsbevestiging."
          : "Verwijzing genegeerd: de doorstuurder heeft zelf nog niet gestort.",
        userId: paid.userId,
        paymentId: paid.id,
        referralId: referral.id,
      });
    } else if (samePublicIp(paid.ipAddress, referrerPaid.ipAddress)) {
      await flagFraud({
        type: "same_ip_referral",
        details: "Geen verwijzingspunten: storting vanaf hetzelfde publieke IP als de doorstuurder.",
        userId: paid.userId,
        paymentId: paid.id,
        referralId: referral.id,
      });
    } else {
      const points = paid.campaign.pointsDirectReferral || POINTS.directSharer;
      const alreadyDirect = await prisma.pointsTransaction.findFirst({
        where: { paymentId: paid.id, source: "direct_referral" },
      });
      if (!alreadyDirect) {
        await prisma.referral.update({
          where: { id: referral.id },
          data: {
            verifiedPayment: true,
            paymentId: paid.id,
            pointsAwarded: { increment: points },
            fraudStatus: "clean",
          },
        });
        await prisma.pointsTransaction.create({
          data: {
            userId: referral.referrerId,
            amount: points,
            reason: "Iemand stortte via uw persoonlijke link",
            source: "direct_referral",
            paymentId: paid.id,
            referralId: referral.id,
          },
        });
        await notifyUser({
          userId: referral.referrerId,
          title: "Iemand stortte via uw link",
          body: `+${points} punten. Open uw dashboard voor de details.`,
          url: "/dashboard",
        });
      }
      const further = paid.campaign.pointsFurtherLevel || POINTS.furtherLine;
      const alreadyFurther = await prisma.pointsTransaction.findFirst({
        where: { paymentId: paid.id, source: "further_level" },
      });
      if (!alreadyFurther && multiLevelEnabled(paid.campaign) && further > 0) {
        await awardLineagePoints({
          paidUserId: paid.userId,
          directReferrerId: referral.referrerId,
          paymentId: paid.id,
          amount: further,
          payerIp: paid.ipAddress,
        });
      }
    }
  }

  if (!isContribution) {
    await notifyUser({
      userId: paid.userId,
      title: "Betaling bevestigd",
      body:
        paid.kind === "sponsor"
          ? "Uw sponsorbijdrage is bevestigd."
          : "Uw pixels staan op de muur.",
      url: paid.kind === "pixel" ? "/pixels" : "/sponsors",
    });
  }

  await audit({
    action: "payment.paid",
    entity: "Payment",
    entityId: paid.id,
    meta: { amountCents: paid.amountCents, userId: paid.userId },
  });

  return paid;
}

export function hashEntries(entryNumbers: string[]) {
  const payload = [...entryNumbers].sort().join("|");
  return createHash("sha256").update(payload).digest("hex");
}
