import Link from "next/link";
import { getPublicCampaignView, parseMoneyBreakdown, resolveBreakdown } from "@/lib/campaign";
import { formatCents } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { LiveCounter, LiveCounterHeadline } from "@/components/LiveCounter";
import { PageHero } from "@/components/PageHero";
import { uniqueVisitorCount, onlineVisitorCount } from "@/lib/visitors";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function VolgAllesPage() {
  const dict = await getDictionary();
  const view = await getPublicCampaignView();
  const [visitors, onlineVisitors] = await Promise.all([uniqueVisitorCount(), onlineVisitorCount()]);
  const resolved = resolveBreakdown(
    parseMoneyBreakdown(view.campaign.moneyBreakdownJson),
    view.totals.raisedCents,
  );
  const breakdown = [
    resolved.find((l) => l.key === "gross") ?? {
      key: "gross",
      label: "Bruto ontvangen bijdragen",
      cents: view.totals.raisedCents,
    },
    resolved.find((l) => l.key === "fees") ?? {
      key: "fees",
      label: "Transactiekosten",
      cents: view.feeCents,
    },
  ];
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId: view.campaign.id, published: true },
    orderBy: { createdAt: "desc" },
  });
  const avg =
    view.totals.participantCount > 0
      ? Math.round(view.totals.raisedCents / view.totals.participantCount)
      : 0;

  const counterStats = {
    raisedCents: view.netCents,
    goalCents: view.campaign.goalCents,
    participantCount: view.totals.participantCount,
    targetContributions: view.campaign.targetContributions,
    remainingCents: view.remainingCents,
    remainingPeople: view.remainingPeople,
    percent: view.percent,
    contributionCents: view.totals.contributionCents,
    sponsorCents: view.totals.sponsorCents,
    sponsorCount: view.totals.sponsorCount,
    pixelCents: view.totals.pixelCents,
    pixelCount: view.totals.pixelCount,
    uniqueVisitors: visitors,
    onlineVisitors,
    deductFees: view.deductFees,
  };

  return (
    <div className="pb-24">
      <PageHero
        kicker={dict.volgAlles.kicker}
        title={dict.volgAlles.title}
        image="/images/urus-night.png"
        overlayPlacement="bottom-right"
        overlay={
          <LiveCounterHeadline initial={counterStats} />
        }
      >
        <p>{dict.volgAlles.lead}</p>
        <Link href="/meedoen" className="btn-yellow mt-6">
          {dict.common.meedoen}
        </Link>
      </PageHero>
      <LiveCounter
        hideHeadlineOnDesktop
        flushTop
        latestUpdate={
          updates[0]
            ? {
                title: updates[0].title,
                body: updates[0].body,
                createdAt: updates[0].createdAt.toISOString(),
              }
            : null
        }
        initial={counterStats}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 lg:grid-cols-4">
        <Info label="Gemiddelde bijdrage" value={formatCents(avg || 200)} />
        <Info label="Status" value={view.campaign.liveMode ? "LIVE" : "Test / nog niet live"} />
        <Info
          label="Startdatum"
          value={view.campaign.startDate?.toLocaleDateString("nl-BE") || "Nog niet vastgelegd"}
        />
        <Info
          label="Einddatum"
          value={view.campaign.endDate?.toLocaleDateString("nl-BE") || "Nog niet vastgelegd"}
        />
      </div>
      <div className="mx-auto mt-16 max-w-7xl px-5">
        <h2 className="font-display text-3xl">Financiële uitsplitsing</h2>
        <div className="mt-6 divide-y divide-white/10 border border-white/10">
          {breakdown.map((line) => (
            <div key={line.key} className="flex justify-between gap-4 px-5 py-4">
              <span>{line.label}</span>
              <span className="text-yellow">{formatCents(line.cents)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-3 md:p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted md:text-xs">{label}</p>
      <p className="mt-1 font-display text-lg md:text-xl">{value}</p>
    </div>
  );
}
