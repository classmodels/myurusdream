import { createHash } from "crypto";
import { prisma } from "./prisma";
import { generateEntryNumber } from "./auth";
import { flagFraud } from "./fraud";
import { multiLevelEnabled } from "./flags";
import { audit } from "./audit";
import { isRoutablePublicIp } from "./phone";
import { notifyUser } from "./notify";
import { POINTS } from "./constants";
import { computeShareAwards, isSelfReferral } from "./referral-rules";
import { attachReferral, loadShareLineage } from "./referral-attach";

function samePublicIp(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b || a !== b) return false;
  return isRoutablePublicIp(a);
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

  let referral = await prisma.referral.findUnique({
    where: { referredUserId: paid.userId },
  });
  if (isContribution && !referral && paid.referralCode) {
    await attachReferral({
      userId: paid.userId,
      email: paid.user.email,
      phoneNormalized: paid.user.phoneNormalized,
      refCode: paid.referralCode,
    });
    referral = await prisma.referral.findUnique({
      where: { referredUserId: paid.userId },
    });
  }
  if (isContribution && referral && referral.fraudStatus !== "blocked") {
    const referrerPaid = await prisma.payment.findFirst({
      where: { userId: referral.referrerId, status: "paid", kind: "contribution" },
      orderBy: { paidAt: "desc" },
    });
    const referrer = await prisma.user.findUnique({ where: { id: referral.referrerId } });
    const self = isSelfReferral(referrer || { id: "", email: "" }, paid.user);

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
    } else {
      if (samePublicIp(paid.ipAddress, referrerPaid.ipAddress)) {
        await flagFraud({
          type: "same_ip_referral",
          details: "Storting vanaf hetzelfde publieke IP als de doorstuurder — punten blijven wel tellen.",
          userId: paid.userId,
          paymentId: paid.id,
          referralId: referral.id,
        });
      }
      const lineage = await loadShareLineage(referral.referrerId, paid.userId);
      const awards = computeShareAwards({
        payerId: paid.userId,
        directReferrerId: referral.referrerId,
        referrerPaid: true,
        self: false,
        blocked: false,
        lineage,
        directPoints: paid.campaign.pointsDirectReferral || POINTS.directSharer,
        furtherPoints: paid.campaign.pointsFurtherLevel || POINTS.furtherLine,
        multiLevel: multiLevelEnabled(paid.campaign),
      });
      for (const award of awards) {
        const source = award.source;
        const already = await prisma.pointsTransaction.findFirst({
          where: { paymentId: paid.id, userId: award.userId, source },
        });
        if (already) continue;
        if (source === "direct_referral") {
          await prisma.referral.update({
            where: { id: referral.id },
            data: {
              verifiedPayment: true,
              paymentId: paid.id,
              pointsAwarded: { increment: award.amount },
              fraudStatus: "clean",
            },
          });
        }
        await prisma.pointsTransaction.create({
          data: {
            userId: award.userId,
            amount: award.amount,
            reason:
              source === "direct_referral"
                ? "Iemand stortte via uw persoonlijke link"
                : "Verdere storting in uw lijn",
            source,
            paymentId: paid.id,
            referralId: source === "direct_referral" ? referral.id : undefined,
          },
        });
        await notifyUser({
          userId: award.userId,
          title: source === "direct_referral" ? "Iemand stortte via uw link" : "Nieuwe punten",
          body: `+${award.amount} punten. Open uw dashboard voor de details.`,
          url: "/dashboard",
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
