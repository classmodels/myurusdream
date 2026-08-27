import { prisma } from "./prisma";
import { audit } from "./audit";

const ipHits = new Map<string, { count: number; ts: number }>();

export function tooManyFromIp(ip: string, limit = 20, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const hit = ipHits.get(ip);
  if (!hit || now - hit.ts > windowMs) {
    ipHits.set(ip, { count: 1, ts: now });
    return false;
  }
  hit.count += 1;
  return hit.count > limit;
}

export async function flagFraud(input: {
  type: string;
  details: string;
  userId?: string;
  paymentId?: string;
  referralId?: string;
  severity?: string;
}) {
  const flag = await prisma.fraudFlag.create({
    data: {
      type: input.type,
      details: input.details,
      userId: input.userId,
      paymentId: input.paymentId,
      referralId: input.referralId,
      severity: input.severity ?? "review",
    },
  });
  await audit({
    action: "fraud.flag",
    entity: "FraudFlag",
    entityId: flag.id,
    meta: { type: input.type },
  });
  return flag;
}

export function looksSuspiciousEmail(email: string) {
  const local = email.split("@")[0] || "";
  if (/(test|fake|spam)\d{4,}/i.test(local)) return true;
  if (local.length > 40) return true;
  return false;
}

export async function checkSelfReferral(referrerId: string, email: string) {
  const referrer = await prisma.user.findUnique({ where: { id: referrerId } });
  if (!referrer) return false;
  return referrer.email.toLowerCase() === email.toLowerCase();
}
