export function canAwardReferralPoints(input: {
  referralBlocked: boolean;
  self: boolean;
  referrerHasPaid: boolean;
}) {
  return !input.referralBlocked && !input.self && input.referrerHasPaid;
}

export function isSelfReferral(
  referrer: { id: string; email: string },
  invitee: { id?: string; email: string },
) {
  if (invitee.id && referrer.id === invitee.id) return true;
  return referrer.email.trim().toLowerCase() === invitee.email.trim().toLowerCase();
}

export type ShareAward = {
  userId: string;
  amount: number;
  source: "direct_referral" | "further_level";
};

export function computeShareAwards(input: {
  payerId: string;
  directReferrerId: string | null;
  referrerPaid: boolean;
  self: boolean;
  blocked: boolean;
  lineage: { referrerId: string; paid: boolean }[];
  directPoints: number;
  furtherPoints: number;
  multiLevel: boolean;
}): ShareAward[] {
  if (
    !input.directReferrerId ||
    input.blocked ||
    input.self ||
    !input.referrerPaid ||
    input.directPoints <= 0
  ) {
    return [];
  }

  const awards: ShareAward[] = [
    {
      userId: input.directReferrerId,
      amount: input.directPoints,
      source: "direct_referral",
    },
  ];

  if (!input.multiLevel || input.furtherPoints <= 0) return awards;

  const seen = new Set([input.payerId, input.directReferrerId]);
  for (const hop of input.lineage) {
    if (!hop.paid) break;
    if (seen.has(hop.referrerId)) continue;
    seen.add(hop.referrerId);
    awards.push({
      userId: hop.referrerId,
      amount: input.furtherPoints,
      source: "further_level",
    });
  }
  return awards;
}

export function noticesVisibleToUser(user: { id: string; createdAt: Date }) {
  return {
    OR: [
      { userId: user.id },
      { userId: null, createdAt: { gte: user.createdAt } },
    ],
  };
}

export function noticeIsForNewAccount(
  notice: { userId: string | null; createdAt: Date },
  user: { id: string; createdAt: Date },
) {
  if (notice.userId === user.id) return true;
  if (notice.userId === null && notice.createdAt >= user.createdAt) return true;
  return false;
}
