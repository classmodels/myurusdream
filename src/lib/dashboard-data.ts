import { prisma } from "./prisma";
import { getPublicCampaignView } from "./campaign";
import { getLotteryList, getPointsLeaderboard } from "./leaderboard";

export async function getDashboardData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const [payments, points, pointRows, referred, view, ranking, tickets] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: user.id, status: "paid", kind: "contribution" },
      orderBy: { paidAt: "desc" },
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
  ]);

  const ticketCountByUser = new Map<string, number>();
  for (const row of tickets) {
    ticketCountByUser.set(row.userId, (ticketCountByUser.get(row.userId) ?? 0) + 1);
  }

  return {
    user,
    payments,
    pointRows,
    referred,
    view,
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
