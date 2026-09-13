import assert from "node:assert/strict";
import { computeShareAwards, isSelfReferral, canAwardReferralPoints } from "../src/lib/referral-rules";
import { parseShareCode } from "../src/lib/referral";

const A = "user-a";
const B = "user-b";
const C = "user-c";
const D = "user-d";

function awardsForC() {
  return computeShareAwards({
    payerId: C,
    directReferrerId: B,
    referrerPaid: true,
    self: false,
    blocked: false,
    lineage: [{ referrerId: A, paid: true }],
    directPoints: 2,
    furtherPoints: 1,
    multiLevel: true,
  });
}

const facebookLike = awardsForC();
assert.deepEqual(
  facebookLike,
  [
    { userId: B, amount: 2, source: "direct_referral" },
    { userId: A, amount: 1, source: "further_level" },
  ],
  "B gets +2 and A gets +1 when C pays via B after A invited B",
);

const fourth = computeShareAwards({
  payerId: D,
  directReferrerId: C,
  referrerPaid: true,
  self: false,
  blocked: false,
  lineage: [
    { referrerId: B, paid: true },
    { referrerId: A, paid: true },
  ],
  directPoints: 2,
  furtherPoints: 1,
  multiLevel: true,
});
assert.deepEqual(fourth, [
  { userId: C, amount: 2, source: "direct_referral" },
  { userId: B, amount: 1, source: "further_level" },
  { userId: A, amount: 1, source: "further_level" },
]);

assert.equal(
  isSelfReferral({ id: A, email: "alain@site.be" }, { id: B, email: "gast@site.be" }),
  false,
  "different accounts are not self-referral",
);
assert.equal(
  isSelfReferral({ id: A, email: "alain@site.be" }, { email: "alain@site.be" }),
  true,
  "same email is self-referral",
);
assert.equal(
  canAwardReferralPoints({ referralBlocked: false, self: false, referrerHasPaid: true }),
  true,
);

const code = "ab12cd34";
assert.equal(parseShareCode(`https://myurusdream.be/meedoen/${code}`), code);
assert.equal(parseShareCode(`https://myurusdream.be/meedoen/${code}?ref=${code}`), code);
assert.equal(parseShareCode(`https://myurusdream.be/meedoen/${code}?fbclid=IwAR123`), code);
assert.equal(parseShareCode(`https://myurusdream.be/?ref=${code}`), code);
assert.equal(
  parseShareCode(`https://l.facebook.com/l.php?u=${encodeURIComponent(`https://myurusdream.be/meedoen/${code}`)}`),
  code,
);

assert.deepEqual(
  computeShareAwards({
    payerId: B,
    directReferrerId: A,
    referrerPaid: true,
    self: false,
    blocked: false,
    lineage: [],
    directPoints: 2,
    furtherPoints: 1,
    multiLevel: true,
  }),
  [{ userId: A, amount: 2, source: "direct_referral" }],
  "first hop from a Facebook link still awards +2 even on the same network",
);

assert.deepEqual(
  computeShareAwards({
    payerId: C,
    directReferrerId: B,
    referrerPaid: true,
    self: false,
    blocked: false,
    lineage: [{ referrerId: A, paid: false }],
    directPoints: 2,
    furtherPoints: 1,
    multiLevel: true,
  }),
  [{ userId: B, amount: 2, source: "direct_referral" }],
  "unpaid ancestor does not get third-line points",
);

console.log("referral chain, Facebook URL, and self-referral tests passed");
