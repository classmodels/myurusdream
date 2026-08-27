import { getPublicCampaignView, parseMoneyBreakdown, resolveBreakdown } from "@/lib/campaign";
import { formatCents } from "@/lib/money";
import { ActivityFeed } from "@/components/ActivityFeed";
import { prisma } from "@/lib/prisma";
import { LiveCounter } from "@/components/LiveCounter";

export const dynamic = "force-dynamic";

export default async function VolgAllesPage() {
  const view = await getPublicCampaignView();
  const breakdown = resolveBreakdown(
    parseMoneyBreakdown(view.campaign.moneyBreakdownJson),
    view.totals.raisedCents,
  );
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId: view.campaign.id, published: true },
    orderBy: { createdAt: "desc" },
  });
  const avg =
    view.totals.participantCount > 0
      ? Math.round(view.totals.raisedCents / view.totals.participantCount)
      : 0;

  return (
    <div className="pb-24 pt-24">
      <div className="mx-auto max-w-7xl px-5">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Transparantie</p>
        <h1 className="mt-3 font-display text-5xl md:text-7xl">Volg alles mee</h1>
      </div>
      <LiveCounter
        initial={{
          raisedCents: view.totals.raisedCents,
          goalCents: view.campaign.goalCents,
          participantCount: view.totals.participantCount,
          targetContributions: view.campaign.targetContributions,
          remainingCents: view.remainingCents,
          remainingPeople: view.remainingPeople,
          percent: view.percent,
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
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
        <Info label="Aankoopstatus" value={view.campaign.purchaseDate ? "Gekocht" : "Nog niet gekocht"} />
        <Info
          label="Aankoopprijs"
          value={
            view.campaign.purchasePriceCents
              ? formatCents(view.campaign.purchasePriceCents)
              : "Nog niet van toepassing"
          }
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
      <div className="mx-auto mt-16 grid max-w-7xl gap-12 px-5 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Updates</h2>
          <div className="mt-6 space-y-4">
            {updates.map((u) => (
              <article key={u.id} className="card-dark p-5">
                <p className="text-xs text-muted">{u.createdAt.toLocaleDateString("nl-BE")}</p>
                <h3 className="mt-1 font-display text-2xl">{u.title}</h3>
                <p className="mt-2 text-white/70">{u.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl">Activiteit</h2>
          <div className="mt-6">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
