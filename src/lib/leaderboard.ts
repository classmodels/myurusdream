import { prisma } from "./prisma";

export type RankingRow = {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
  rank: number;
};

export async function getPointsLeaderboard(limit = 250): Promise<RankingRow[]> {
  const paidUsers = await prisma.user.findMany({
    where: {
      role: "participant",
      payments: { some: { status: "paid", kind: "contribution" } },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      pointsTransactions: { select: { amount: true } },
    },
  });

  const ranked = paidUsers
    .map((u) => ({
      id: u.id,
      firstName: (u.firstName || "").trim(),
      lastName: (u.lastName || "").trim(),
      points: u.pointsTransactions.reduce((sum, row) => sum + row.amount, 0),
      createdAt: u.createdAt,
    }))
    .sort((a, b) => b.points - a.points || a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, limit)
    .map((row, index) => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      points: row.points,
      rank: index + 1,
    }));

  return ranked;
}

export type LotteryRow = {
  id: string;
  entryNumber: string;
  firstName: string;
  lastName: string;
  userId: string;
  createdAt: string;
};

export async function getLotteryList(limit = 400): Promise<LotteryRow[]> {
  const entries = await prisma.prizeEntry.findMany({
    where: {
      valid: true,
      payment: { status: "paid", kind: "contribution" },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      entryNumber: true,
      createdAt: true,
      userId: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return entries.map((row) => ({
    id: row.id,
    entryNumber: row.entryNumber,
    firstName: (row.user.firstName || "").trim(),
    lastName: (row.user.lastName || "").trim(),
    userId: row.userId,
    createdAt: row.createdAt.toISOString(),
  }));
}

export function displayPersonName(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`.trim();
  return name || "Deelnemer";
}
