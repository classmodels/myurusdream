import { createHash } from "crypto";
import { prisma } from "./prisma";
import { generateEntryNumber } from "./auth";
import { flagFraud } from "./fraud";
import { multiLevelEnabled } from "./flags";
import { audit } from "./audit";

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

  const existingEntry = await prisma.prizeEntry.findFirst({
    where: { paymentId: paid.id },
  });
  if (!existingEntry) {
    await prisma.prizeEntry.create({
      data: {
        userId: paid.userId,
        paymentId: paid.id,
        entryNumber: generateEntryNumber(),
        valid: true,
      },
    });
  }

  const ownPoints = paid.campaign.pointsOwnContribution;
  const alreadyOwn = await prisma.pointsTransaction.findFirst({
    where: { paymentId: paid.id, source: "own_contribution" },
  });
  if (!alreadyOwn && ownPoints > 0) {
    await prisma.pointsTransaction.create({
      data: {
        userId: paid.userId,
        amount: ownPoints,
        reason: "Eigen bevestigde bijdrage",
        source: "own_contribution",
        paymentId: paid.id,
      },
    });
  }

  const referral = await prisma.referral.findUnique({
    where: { referredUserId: paid.userId },
  });
  if (referral && !referral.verifiedPayment) {
    if (referral.referrerId === paid.userId) {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { fraudStatus: "blocked", verifiedPayment: false },
      });
      await flagFraud({
        type: "self_referral",
        details: "Self-referral geblokkeerd bij betalingsbevestiging.",
        userId: paid.userId,
        paymentId: paid.id,
        referralId: referral.id,
      });
    } else {
      const points = paid.campaign.pointsDirectReferral;
      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          verifiedPayment: true,
          paymentId: paid.id,
          pointsAwarded: points,
          fraudStatus: "clean",
        },
      });
      await prisma.pointsTransaction.create({
        data: {
          userId: referral.referrerId,
          amount: points,
          reason: "Directe deelnemer via persoonlijke link",
          source: "direct_referral",
          paymentId: paid.id,
          referralId: referral.id,
        },
      });
      if (paid.campaign.pointsReferredBonus > 0) {
        await prisma.pointsTransaction.create({
          data: {
            userId: paid.userId,
            amount: paid.campaign.pointsReferredBonus,
            reason: "Bonus als uitgenodigde deelnemer",
            source: "referred_bonus",
            paymentId: paid.id,
            referralId: referral.id,
          },
        });
      }
      if (multiLevelEnabled(paid.campaign)) {
        await prisma.pointsTransaction.create({
          data: {
            userId: referral.referrerId,
            amount: paid.campaign.pointsFurtherLevel,
            reason: "Verdere lijn (alleen indien multi-level wettelijk aanstaat)",
            source: "further_level",
            paymentId: paid.id,
            referralId: referral.id,
          },
        });
      }
    }
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
