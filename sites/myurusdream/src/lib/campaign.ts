import { prisma } from "./prisma";
import { parseChecklist, publicPrizeEnabled, publicReferralEnabled } from "./flags";
import { CAMPAIGN_SLUG, DEFAULT_CHECKLIST } from "./constants";

export async function getCampaign() {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: CAMPAIGN_SLUG },
  });
  if (!campaign) throw new Error("Campaign not seeded");
  return campaign;
}

export async function getLiveTotals(campaignId: string) {
  const grouped = await prisma.payment.groupBy({
    by: ["kind"],
    where: { campaignId, status: "paid" },
    _sum: { amountCents: true },
    _count: { _all: true },
  });
  const byKind = Object.fromEntries(
    grouped.map((g) => [
      g.kind,
      { cents: g._sum.amountCents ?? 0, count: g._count._all },
    ]),
  );
  const contributionCents = byKind.contribution?.cents ?? 0;
  const participantCount = byKind.contribution?.count ?? 0;
  const sponsorCents = byKind.sponsor?.cents ?? 0;
  const sponsorCount = byKind.sponsor?.count ?? 0;
  const pixelCents = byKind.pixel?.cents ?? 0;
  const pixelCount = byKind.pixel?.count ?? 0;
  const raisedCents = grouped.reduce((sum, g) => sum + (g._sum.amountCents ?? 0), 0);
  return {
    raisedCents,
    participantCount,
    contributionCents,
    sponsorCents,
    sponsorCount,
    pixelCents,
    pixelCount,
  };
}

export type MoneyLine = {
  key: string;
  label: string;
  cents: number;
  note?: string;
  dynamic?: boolean;
  deductOnFrontend?: boolean;
};

export function parseMoneyBreakdown(json: string): MoneyLine[] {
  try {
    const parsed = JSON.parse(json) as MoneyLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function transactionFeeCents(lines: MoneyLine[]): number {
  return Math.max(0, lines.find((l) => l.key === "fees")?.cents ?? 0);
}

export function feesDeductOnFrontend(lines: MoneyLine[]): boolean {
  return lines.find((l) => l.key === "fees")?.deductOnFrontend === true;
}

export async function getPublicCampaignView() {
  const campaign = await getCampaign();
  const totals = await getLiveTotals(campaign.id);
  const lines = parseMoneyBreakdown(campaign.moneyBreakdownJson);
  const feeCents = transactionFeeCents(lines);
  const deductFees = feesDeductOnFrontend(lines);
  const netCents = deductFees ? Math.max(0, totals.raisedCents - feeCents) : totals.raisedCents;
  const remainingCents = Math.max(0, campaign.goalCents - netCents);
  const remainingPeople = Math.max(
    0,
    campaign.targetContributions - totals.participantCount,
  );
  const pct = campaign.goalCents > 0 ? (netCents / campaign.goalCents) * 100 : 0;

  return {
    campaign,
    totals,
    feeCents,
    deductFees,
    netCents,
    remainingCents,
    remainingPeople,
    percent: Math.min(100, pct),
    checklist: parseChecklist(campaign.checklistJson),
    prizePublic: publicPrizeEnabled(campaign),
    referralPublic: publicReferralEnabled(campaign),
  };
}

export function defaultMoneyBreakdown(): MoneyLine[] {
  return [
    {
      key: "gross",
      label: "Bruto ontvangen bijdragen",
      cents: 0,
      dynamic: true,
      note: "Som van alle bevestigde betalingen.",
    },
    {
      key: "fees",
      label: "Transactiekosten",
      cents: 0,
      note: "Schatting. Exacte kosten volgen uit de betaalprovider.",
    },
  ];
}

export function resolveBreakdown(
  lines: MoneyLine[],
  raisedCents: number,
): MoneyLine[] {
  const mapped = lines.map((line) =>
    line.key === "gross" && line.dynamic ? { ...line, cents: raisedCents } : line,
  );
  const remainderIdx = mapped.findIndex((l) => l.key === "remainder");
  if (remainderIdx >= 0 && mapped[remainderIdx].dynamic) {
    const spent = mapped
      .filter((l) => l.key !== "gross" && l.key !== "remainder")
      .reduce((sum, l) => sum + (l.cents || 0), 0);
    mapped[remainderIdx] = {
      ...mapped[remainderIdx],
      cents: raisedCents - spent,
    };
  }
  return mapped;
}

export { DEFAULT_CHECKLIST };
