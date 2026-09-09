import { prisma } from "@/lib/prisma";
import { POINTS, VISITOR_GOAL } from "@/lib/constants";

export type ReachStats = {
  directPeople: number;
  indirectEvents: number;
  totalPeopleEstimate: number;
  directPoints: number;
  furtherPoints: number;
  totalPoints: number;
  ownPoints: number;
  rank: number | null;
  rankingSize: number;
  visitorGoal: number;
};

export async function getReachStats(userId: string): Promise<ReachStats> {
  const [directPeople, pointGroups, totalPointsAgg, ranking] = await Promise.all([
    prisma.referral.count({
      where: { referrerId: userId, verifiedPayment: true },
    }),
    prisma.pointsTransaction.groupBy({
      by: ["source"],
      where: { userId },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.pointsTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.pointsTransaction.groupBy({
      by: ["userId"],
      _sum: { amount: true },
    }),
  ]);

  const bySource = Object.fromEntries(
    pointGroups.map((g) => [
      g.source,
      { points: g._sum.amount ?? 0, count: g._count._all },
    ]),
  );

  const directPoints = bySource.direct_referral?.points ?? 0;
  const furtherPoints = bySource.further_level?.points ?? 0;
  const ownPoints = bySource.own_contribution?.points ?? 0;
  const indirectEvents = bySource.further_level?.count ?? 0;
  const totalPoints = totalPointsAgg._sum.amount ?? 0;

  const sorted = ranking
    .map((r) => ({
      userId: r.userId,
      points: r._sum.amount ?? 0,
    }))
    .sort((a, b) => b.points - a.points);
  const rankIndex = sorted.findIndex((r) => r.userId === userId);

  return {
    directPeople,
    indirectEvents,
    totalPeopleEstimate: directPeople + indirectEvents,
    directPoints,
    furtherPoints,
    totalPoints,
    ownPoints,
    rank: rankIndex >= 0 ? rankIndex + 1 : null,
    rankingSize: sorted.length,
    visitorGoal: VISITOR_GOAL,
  };
}

export async function getAdminReachRows(limit = 200) {
  const users = await prisma.user.findMany({
    where: {
      role: "participant",
      OR: [
        { payments: { some: { status: "paid", kind: "contribution" } } },
        { pointsTransactions: { some: {} } },
        { referralsMade: { some: { verifiedPayment: true } } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      participantNumber: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const rows = await Promise.all(
    users.map(async (u) => {
      const reach = await getReachStats(u.id);
      const paidContributions = await prisma.payment.count({
        where: { userId: u.id, status: "paid", kind: "contribution" },
      });
      return {
        ...u,
        paidContributions,
        ...reach,
      };
    }),
  );

  return rows.sort((a, b) => b.totalPoints - a.totalPoints || b.directPeople - a.directPeople);
}

export const REACH_POINT_HINT = {
  direct: POINTS.directSharer,
  further: POINTS.furtherLine,
} as const;
