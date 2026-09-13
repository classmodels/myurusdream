/**
 * Live check: a referred €2 from the same public IP still awards +2 to the sharer,
 * and a new account does not inherit broadcast notices from before signup.
 */
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("sslaccept=")) {
  process.env.DATABASE_URL +=
    (process.env.DATABASE_URL.includes("?") ? "&" : "?") + "sslaccept=accept_invalid_certs";
}

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { fulfillPaidPayment } = await import("../src/lib/payments");
  const { CAMPAIGN_SLUG } = await import("../src/lib/constants");
  const { nextParticipantNumber, generateReferralCode } = await import("../src/lib/auth");

  const stamp = Date.now().toString(36);
  const emails = {
    sharer: `ref-test-sharer-${stamp}@example.invalid`,
    guest: `ref-test-guest-${stamp}@example.invalid`,
  };

  function assert(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
    console.log(`ok  ${message}`);
  }

  const ids: string[] = [];
  const noticeIds: string[] = [];

  async function cleanup() {
    await prisma.noticeRead.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
    await prisma.notice
      .deleteMany({ where: { OR: [{ id: { in: noticeIds } }, { userId: { in: ids } }] } })
      .catch(() => undefined);
    await prisma.pointsTransaction.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
    await prisma.prizeEntry.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
    await prisma.referral
      .deleteMany({ where: { OR: [{ referrerId: { in: ids } }, { referredUserId: { in: ids } }] } })
      .catch(() => undefined);
    await prisma.fraudFlag.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
    await prisma.payment.deleteMany({ where: { userId: { in: ids } } }).catch(() => undefined);
    await prisma.user.deleteMany({ where: { id: { in: ids } } }).catch(() => undefined);
  }

  try {
    const campaign = await prisma.campaign.findUnique({ where: { slug: CAMPAIGN_SLUG } });
    if (!campaign) throw new Error("Campaign not seeded");

    const oldNotice = await prisma.notice.create({
      data: {
        userId: null,
        title: `old-broadcast-${stamp}`,
        body: "Should not appear on a later account",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });
    noticeIds.push(oldNotice.id);

    const sharer = await prisma.user.create({
      data: {
        email: emails.sharer,
        firstName: "Sharer",
        lastName: "Test",
        participantNumber: await nextParticipantNumber(),
        referralCode: `t${generateReferralCode()}`.slice(0, 12),
        lastIp: "203.0.113.10",
      },
    });
    ids.push(sharer.id);

    const sharerPay = await prisma.payment.create({
      data: {
        userId: sharer.id,
        campaignId: campaign.id,
        amountCents: 200,
        status: "pending",
        kind: "contribution",
        ipAddress: "203.0.113.10",
      },
    });
    await fulfillPaidPayment(sharerPay.id);

    const guest = await prisma.user.create({
      data: {
        email: emails.guest,
        firstName: "Guest",
        lastName: "Test",
        participantNumber: await nextParticipantNumber(),
        referralCode: `g${generateReferralCode()}`.slice(0, 12),
        lastIp: "203.0.113.10",
      },
    });
    ids.push(guest.id);

    await prisma.referral.create({
      data: {
        referrerId: sharer.id,
        referredUserId: guest.id,
        referralCode: sharer.referralCode,
        source: "checkout",
        fraudStatus: "clean",
      },
    });

    const guestPay = await prisma.payment.create({
      data: {
        userId: guest.id,
        campaignId: campaign.id,
        amountCents: 200,
        status: "pending",
        kind: "contribution",
        ipAddress: "203.0.113.10",
      },
    });
    await fulfillPaidPayment(guestPay.id);

    const direct = await prisma.pointsTransaction.findFirst({
      where: { userId: sharer.id, source: "direct_referral", paymentId: guestPay.id },
    });
    assert(Boolean(direct), "sharer received +2 for a referred payment");
    assert((direct?.amount ?? 0) === (campaign.pointsDirectReferral || 2), "direct referral points match campaign");

    const visible = await prisma.notice.findMany({
      where: {
        OR: [{ userId: guest.id }, { userId: null, createdAt: { gte: guest.createdAt } }],
      },
    });
    assert(
      visible.every((row) => row.title !== oldNotice.title),
      "new account does not receive broadcasts from before signup",
    );

    console.log("referral points and notice cutoff tests passed");
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
