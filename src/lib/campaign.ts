import { prisma } from "./prisma";
import { parseChecklist, publicPrizeEnabled, publicReferralEnabled } from "./flags";
import { DEFAULT_CHECKLIST } from "./constants";

export async function getCampaign() {
  const campaign = await prisma.campaign.findUnique({
    where: { slug: "droomop2" },
  });
  if (!campaign) throw new Error("Campaign not seeded");
  return campaign;
}

export async function getLiveTotals(campaignId: string) {
  const paid = await prisma.payment.aggregate({
    where: { campaignId, status: "paid" },
    _sum: { amountCents: true },
    _count: { _all: true },
  });
  return {
    raisedCents: paid._sum.amountCents ?? 0,
    participantCount: paid._count._all,
  };
}

export type MoneyLine = {
  key: string;
  label: string;
  cents: number;
  note?: string;
  dynamic?: boolean;
};

export function parseMoneyBreakdown(json: string): MoneyLine[] {
  try {
    const parsed = JSON.parse(json) as MoneyLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getPublicCampaignView() {
  const campaign = await getCampaign();
  const totals = await getLiveTotals(campaign.id);
  const remainingCents = Math.max(0, campaign.goalCents - totals.raisedCents);
  const remainingPeople = Math.max(
    0,
    campaign.targetContributions - totals.participantCount,
  );
  const pct =
    campaign.goalCents > 0
      ? (totals.raisedCents / campaign.goalCents) * 100
      : 0;

  return {
    campaign,
    totals,
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
    {
      key: "tax",
      label: "Belastingen indien van toepassing",
      cents: 0,
      note: "Nog te bepalen na fiscale controle.",
    },
    {
      key: "legal",
      label: "Juridische en administratieve kosten",
      cents: 0,
    },
    {
      key: "vehicle",
      label: "Aankoopprijs voertuig (indicatief)",
      cents: 0,
      note: "€400.000 is het brutodoel, niet automatisch de aankoopprijs.",
    },
    { key: "insurance", label: "Verzekering", cents: 0 },
    { key: "registration", label: "Inschrijving", cents: 0 },
    { key: "other", label: "Overige kosten", cents: 0 },
    {
      key: "remainder",
      label: "Resterend bedrag",
      cents: 0,
      dynamic: true,
      note: "Bruto minus de hierboven ingevulde posten.",
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
