import { prisma } from "./prisma";
import { getPublicCampaignView } from "./campaign";
import { getLotteryList, getPointsLeaderboard } from "./leaderboard";
import { getReachStats } from "./reach";

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [payments, sponsorPayments, points, pointRows, referred, view, ranking, tickets, reach] =
    await Promise.all([
      prisma.payment.findMany({
        where: { userId: user.id, status: "paid", kind: "contribution" },
        orderBy: { paidAt: "desc" },
      }),
      prisma.payment.findMany({
        where: {
          userId: user.id,
          status: "paid",
          kind: { in: ["sponsor", "pixel"] },
        },
        orderBy: { paidAt: "desc" },
        select: {
          id: true,
          kind: true,
          sponsorName: true,
          sponsorUrl: true,
          sponsorTier: true,
          pixelImage: true,
          pixelLabel: true,
          amountCents: true,
          _count: { select: { outboundClicks: true } },
        },
      }),
      prisma.pointsTransaction.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      }),
      prisma.pointsTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.referral.findMany({
        where: { referrerId: user.id, verifiedPayment: true },
        include: {
          referredUser: { select: { firstName: true, lastName: true, participantNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      getPublicCampaignView(),
      getPointsLeaderboard(),
      getLotteryList(),
      getReachStats(userId),
    ]);

  const ticketCountByUser = new Map<string, number>();
  for (const row of tickets) {
    ticketCountByUser.set(row.userId, (ticketCountByUser.get(row.userId) ?? 0) + 1);
  }

  return {
    user,
    payments,
    sponsorPlacements: sponsorPayments.map((p) => ({
      id: p.id,
      kind: p.kind,
      sponsorName: p.sponsorName,
      sponsorUrl: p.sponsorUrl,
      sponsorTier: p.sponsorTier,
      pixelImage: p.pixelImage,
      pixelLabel: p.pixelLabel,
      amountCents: p.amountCents,
      clickCount: p._count.outboundClicks,
    })),
    pointRows,
    referred,
    view,
    reach,
    totalPoints: points._sum.amount ?? 0,
    rankingRows: ranking.map((row) => ({
      rank: row.rank,
      firstName: row.firstName,
      lastName: row.lastName,
      points: row.points,
      tickets: ticketCountByUser.get(row.id) ?? 0,
      isYou: row.id === user.id,
    })),
    ticketRows: tickets.map((row) => ({
      id: row.id,
      entryNumber: row.entryNumber,
      firstName: row.firstName,
      lastName: row.lastName,
      isYou: row.userId === user.id,
    })),
    myRank: ranking.find((row) => row.id === user.id)?.rank ?? null,
  };
}
