import type { Campaign } from "@prisma/client";
import { DEFAULT_CHECKLIST, type ChecklistKey } from "./constants";

export const DISABLED_PENDING_LEGAL_APPROVAL =
  process.env.DISABLED_PENDING_LEGAL_APPROVAL !== "false";

export const PRIZE_FEATURE_ENABLED =
  process.env.PRIZE_FEATURE_ENABLED === "true";

export const MULTI_LEVEL_REFERRALS =
  process.env.MULTI_LEVEL_REFERRALS === "true";

export type Checklist = Record<ChecklistKey, boolean>;

export function parseChecklist(json: string): Checklist {
  try {
    const parsed = JSON.parse(json) as Partial<Checklist>;
    return { ...DEFAULT_CHECKLIST, ...parsed };
  } catch {
    return { ...DEFAULT_CHECKLIST };
  }
}

export function allChecklistComplete(checklist: Checklist): boolean {
  return (Object.keys(DEFAULT_CHECKLIST) as ChecklistKey[]).every(
    (key) => checklist[key] === true,
  );
}

export function publicReferralEnabled(campaign: Campaign): boolean {
  return campaign.referralPublicEnabled;
}

export function publicPrizeEnabled(campaign: Campaign): boolean {
  const checklist = parseChecklist(campaign.checklistJson);
  return (
    PRIZE_FEATURE_ENABLED &&
    campaign.prizeFeatureEnabled &&
    checklist.prizeLegalApproved
  );
}

export function multiLevelEnabled(campaign: Campaign): boolean {
  return campaign.multiLevelEnabled;
}

export function paymentsAllowed(campaign: Campaign): {
  allowed: boolean;
  reason: string | null;
} {
  if (!campaign.goalFailureScenario) {
    return {
      allowed: false,
      reason: "Betalen staat nog niet open.",
    };
  }
  if (campaign.paymentsPaused || !campaign.paymentsEnabled) {
    return {
      allowed: false,
      reason: "Betalingen zijn tijdelijk gepauzeerd.",
    };
  }
  if (campaign.status === "ended") {
    return { allowed: false, reason: "Deze campagne is afgelopen." };
  }
  return { allowed: true, reason: null };
}

export function canSwitchLive(campaign: Campaign): boolean {
  return allChecklistComplete(parseChecklist(campaign.checklistJson));
}
