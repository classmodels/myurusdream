import assert from "node:assert/strict";
import { canAwardReferralPoints, noticeIsForNewAccount } from "../src/lib/referral-rules";

assert.equal(
  canAwardReferralPoints({ referralBlocked: false, self: false, referrerHasPaid: true }),
  true,
  "normal referred payment awards points",
);
assert.equal(
  canAwardReferralPoints({ referralBlocked: false, self: true, referrerHasPaid: true }),
  false,
  "self-referral does not award",
);
assert.equal(
  canAwardReferralPoints({ referralBlocked: false, self: false, referrerHasPaid: false }),
  false,
  "unpaid sharer does not award",
);
assert.equal(
  canAwardReferralPoints({ referralBlocked: true, self: false, referrerHasPaid: true }),
  false,
  "blocked referral does not award",
);

const createdAt = new Date("2026-09-07T00:00:00.000Z");
const user = { id: "u1", createdAt };
assert.equal(
  noticeIsForNewAccount({ userId: null, createdAt: new Date("2026-09-06T00:00:00.000Z") }, user),
  false,
  "old broadcast hidden",
);
assert.equal(
  noticeIsForNewAccount({ userId: null, createdAt: new Date("2026-09-07T12:00:00.000Z") }, user),
  true,
  "new broadcast visible",
);
assert.equal(
  noticeIsForNewAccount({ userId: "u1", createdAt: new Date("2026-09-01T00:00:00.000Z") }, user),
  true,
  "personal notice visible",
);

console.log("referral policy tests passed");
