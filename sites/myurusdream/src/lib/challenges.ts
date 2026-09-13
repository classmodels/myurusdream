import { POINTS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getPublicCampaignView } from "@/lib/campaign";

export type ChallengeStatus =
  | "pending"
  | "active"
  | "awaiting_video"
  | "completed"
  | "declined"
  | "cancelled";

export type ChallengePublic = {
  id: string;
  title: string;
  stake: string;
  endMode: "date" | "counter";
  endsAt: string | null;
  targetCents: number | null;
  status: ChallengeStatus;
  acceptedAt: string | null;
  videoUrl: string | null;
  createdAt: string;
  challenger: { id: string; firstName: string; lastName: string };
  challenged: { id: string; firstName: string; lastName: string };
  loser: { id: string; firstName: string; lastName: string } | null;
  challengerPointsDuring: number;
  challengedPointsDuring: number;
};

function person(u: { id: string; firstName: string | null; lastName: string | null }) {
  return {
    id: u.id,
    firstName: (u.firstName || "").trim(),
    lastName: (u.lastName || "").trim(),
  };
}

async function pointsSince(userId: string, since: Date) {
  const agg = await prisma.pointsTransaction.aggregate({
    where: {
      userId,
      createdAt: { gte: since },
      source: { in: ["own_contribution", "direct_referral", "further_level"] },
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

export async function userHasPaidContribution(userId: string) {
  const n = await prisma.payment.count({
    where: { userId, status: "paid", kind: "contribution" },
  });
  return n > 0;
}

export async function searchPaidParticipants(query: string, excludeUserId: string, limit = 12) {
  const q = query.trim();
  if (q.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      role: "participant",
      blocked: false,
      payments: { some: { status: "paid", kind: "contribution" } },
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, participantNumber: true },
    take: limit,
    orderBy: { firstName: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    firstName: (u.firstName || "").trim(),
    lastName: (u.lastName || "").trim(),
    participantNumber: u.participantNumber,
  }));
}

async function serializeChallenge(row: {
  id: string;
  title: string;
  stake: string;
  endMode: string;
  endsAt: Date | null;
  targetCents: number | null;
  status: string;
  acceptedAt: Date | null;
  videoUrl: string | null;
  createdAt: Date;
  challenger: { id: string; firstName: string | null; lastName: string | null };
  challenged: { id: string; firstName: string | null; lastName: string | null };
  loser: { id: string; firstName: string | null; lastName: string | null } | null;
}): Promise<ChallengePublic> {
  const since = row.acceptedAt ?? row.createdAt;
  const [challengerPointsDuring, challengedPointsDuring] = await Promise.all([
    pointsSince(row.challenger.id, since),
    pointsSince(row.challenged.id, since),
  ]);

  return {
    id: row.id,
    title: row.title,
    stake: row.stake,
    endMode: row.endMode === "counter" ? "counter" : "date",
    endsAt: row.endsAt?.toISOString() ?? null,
    targetCents: row.targetCents,
    status: row.status as ChallengeStatus,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    videoUrl: row.videoUrl,
    createdAt: row.createdAt.toISOString(),
    challenger: person(row.challenger),
    challenged: person(row.challenged),
    loser: row.loser ? person(row.loser) : null,
    challengerPointsDuring,
    challengedPointsDuring,
  };
}

const includePeople = {
  challenger: { select: { id: true, firstName: true, lastName: true } },
  challenged: { select: { id: true, firstName: true, lastName: true } },
  loser: { select: { id: true, firstName: true, lastName: true } },
} as const;

async function challengeDeadlineReached(row: {
  endMode: string;
  endsAt: Date | null;
  targetCents: number | null;
}) {
  if (row.endMode === "counter" && row.targetCents != null) {
    const view = await getPublicCampaignView();
    return view.totals.raisedCents >= row.targetCents;
  }
  if (row.endsAt) return row.endsAt.getTime() <= Date.now();
  return false;
}

/** Resolve active challenges whose deadline/counter target is reached. */
export async function resolveDueChallenges() {
  const active = await prisma.challenge.findMany({
    where: { status: "active" },
    include: includePeople,
  });

  for (const row of active) {
    if (!(await challengeDeadlineReached(row))) continue;
    const since = row.acceptedAt ?? row.createdAt;
    const [a, b] = await Promise.all([
      pointsSince(row.challengerId, since),
      pointsSince(row.challengedId, since),
    ]);
    // Lower activity during the race loses; tie → challenged loses (did the dare).
    const loserId = a === b ? row.challengedId : a < b ? row.challengerId : row.challengedId;
    await prisma.challenge.update({
      where: { id: row.id },
      data: { status: "awaiting_video", loserId },
    });
  }
}

export async function listChallenges(): Promise<ChallengePublic[]> {
  await resolveDueChallenges();
  const rows = await prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: includePeople,
  });
  return Promise.all(rows.map((row) => serializeChallenge(row)));
}

export async function createChallenge(input: {
  challengerId: string;
  challengedId: string;
  title: string;
  stake: string;
  endMode: "date" | "counter";
  endsAt?: Date | null;
  targetCents?: number | null;
}) {
  if (!prisma.challenge) {
    throw new Error("Challenge-tabel nog niet geladen. Herstart even de lokale server (npm run dev).");
  }
  if (input.challengerId === input.challengedId) {
    throw new Error("U kunt uzelf niet uitdagen.");
  }
  const [okA, okB] = await Promise.all([
    userHasPaidContribution(input.challengerId),
    userHasPaidContribution(input.challengedId),
  ]);
  if (!okA || !okB) {
    throw new Error("Beide personen moeten al €2 gestort hebben.");
  }

  const title = input.title.trim().slice(0, 120);
  const stake = input.stake.trim().slice(0, 800);
  if (title.length < 3 || stake.length < 5) {
    throw new Error("Vul een korte titel en de opdracht voor de verliezer in.");
  }

  if (input.endMode === "date") {
    if (!input.endsAt || input.endsAt.getTime() <= Date.now() + 60 * 60 * 1000) {
      throw new Error("Kies een einddatum minstens 1 uur in de toekomst.");
    }
  } else {
    if (!input.targetCents || input.targetCents < 200) {
      throw new Error("Kies een tellerbedrag als eindpunt.");
    }
    const view = await getPublicCampaignView();
    if (input.targetCents <= view.totals.raisedCents) {
      throw new Error("Het tellerbedrag moet hoger liggen dan het huidige totaal.");
    }
  }

  const open = await prisma.challenge.count({
    where: {
      status: { in: ["pending", "active", "awaiting_video"] },
      OR: [
        { challengerId: input.challengerId, challengedId: input.challengedId },
        { challengerId: input.challengedId, challengedId: input.challengerId },
      ],
    },
  });
  if (open > 0) {
    throw new Error("Er loopt al een challenge tussen jullie.");
  }

  const row = await prisma.challenge.create({
    data: {
      challengerId: input.challengerId,
      challengedId: input.challengedId,
      title,
      stake,
      endMode: input.endMode,
      endsAt: input.endMode === "date" ? input.endsAt! : null,
      targetCents: input.endMode === "counter" ? input.targetCents! : null,
      status: "pending",
    },
    include: includePeople,
  });

  return serializeChallenge(row);
}

export async function acceptChallenge(challengeId: string, userId: string) {
  const row = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!row || row.challengedId !== userId) throw new Error("Niet uw challenge.");
  if (row.status !== "pending") throw new Error("Deze challenge kan niet meer aanvaard worden.");

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: "active", acceptedAt: new Date() },
    include: includePeople,
  });
  return serializeChallenge(updated);
}

export async function declineChallenge(challengeId: string, userId: string) {
  const row = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!row || row.challengedId !== userId) throw new Error("Niet uw challenge.");
  if (row.status !== "pending") throw new Error("Deze challenge kan niet meer geweigerd worden.");

  const updated = await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: "declined" },
    include: includePeople,
  });
  return serializeChallenge(updated);
}

export async function uploadChallengeVideo(challengeId: string, userId: string, videoUrl: string) {
  const row = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!row) throw new Error("Challenge niet gevonden.");
  if (row.status !== "awaiting_video") {
    throw new Error("Er moet eerst een verliezer zijn voor u een filmpje uploadt.");
  }
  if (row.loserId !== userId) throw new Error("Alleen de verliezer uploadt het filmpje.");
  if (row.pointsAwarded) throw new Error("Deze challenge is al afgerond.");

  const updated = await prisma.$transaction(async (tx) => {
    const challenge = await tx.challenge.update({
      where: { id: challengeId },
      data: {
        status: "completed",
        videoUrl,
        videoUploadedAt: new Date(),
        pointsAwarded: true,
      },
      include: includePeople,
    });

    const reason = `Challenge voltooid: ${challenge.title}`;
    await tx.pointsTransaction.createMany({
      data: [
        {
          userId: challenge.challengerId,
          amount: POINTS.challengeComplete,
          reason,
          source: "challenge_complete",
        },
        {
          userId: challenge.challengedId,
          amount: POINTS.challengeComplete,
          reason,
          source: "challenge_complete",
        },
      ],
    });

    return challenge;
  });

  return serializeChallenge(updated);
}
