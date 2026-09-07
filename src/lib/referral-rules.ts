export function canAwardReferralPoints(input: {
  referralBlocked: boolean;
  self: boolean;
  referrerHasPaid: boolean;
}) {
  return !input.referralBlocked && !input.self && input.referrerHasPaid;
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
