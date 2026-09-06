import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getLotteryList, getPointsLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const [ranking, tickets] = await Promise.all([getPointsLeaderboard(), getLotteryList()]);
  const ticketCountByUser = new Map<string, number>();
  for (const row of tickets) {
    ticketCountByUser.set(row.userId, (ticketCountByUser.get(row.userId) ?? 0) + 1);
  }

  const me = ranking.find((row) => row.id === user.id);
  const myPoints =
    me?.points ??
    (
      await prisma.pointsTransaction.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      })
    )._sum.amount ??
    0;

  return NextResponse.json({
    ranking: ranking.map((row) => ({
      rank: row.rank,
      firstName: row.firstName,
      lastName: row.lastName,
      points: row.points,
      tickets: ticketCountByUser.get(row.id) ?? 0,
      isYou: row.id === user.id,
    })),
    tickets: tickets.map((row) => ({
      id: row.id,
      entryNumber: row.entryNumber,
      firstName: row.firstName,
      lastName: row.lastName,
      isYou: row.userId === user.id,
    })),
    me: {
      rank: me?.rank ?? null,
      points: myPoints,
      tickets: ticketCountByUser.get(user.id) ?? 0,
    },
  });
}
