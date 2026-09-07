import { requireAdminPage } from "@/lib/admin";
import { AdminChrome, Kpi } from "@/components/AdminChrome";
import { getCampaign, getLiveTotals } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { uniqueVisitorCount, todayVisitorCount, onlineVisitorCount } from "@/lib/visitors";
import { reviewFraud } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const campaign = await getCampaign();
  const totals = await getLiveTotals(campaign.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [
    todayPay,
    users,
    visitors,
    todayVisitors,
    online,
    fraudOpen,
    flags,
    payments,
  ] = await Promise.all([
    prisma.payment.count({ where: { campaignId: campaign.id, status: "paid", paidAt: { gte: today } } }),
    prisma.user.count({ where: { role: "participant" } }),
    uniqueVisitorCount(),
    todayVisitorCount(),
    onlineVisitorCount(),
    prisma.fraudFlag.count({ where: { status: "open" } }),
    prisma.fraudFlag.findMany({ where: { status: "open" }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: true } }),
  ]);

  return (
    <AdminChrome title="Overzicht">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Ontvangen" value={formatCents(totals.raisedCents)} />
        <Kpi label="Accounts" value={String(users)} />
        <Kpi label="Bezoekers totaal" value={String(visitors)} />
        <Kpi label="Bezoekers vandaag" value={String(todayVisitors)} />
        <Kpi label="Nu live" value={String(online)} />
        <Kpi label="€2 stortingen" value={String(totals.participantCount)} />
        <Kpi label="Sponsors" value={`${totals.sponsorCount} · ${formatCents(totals.sponsorCents)}`} />
        <Kpi label="Betalingen vandaag" value={String(todayPay)} />
        <Kpi label="Pixels" value={`${totals.pixelCount} · ${formatCents(totals.pixelCents)}`} />
        <Kpi label="Open fraud" value={String(fraudOpen)} />
      </div>

      <section>
        <h2 className="font-display text-3xl">Recente betalingen</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {payments.length ? (
            payments.map((p) => (
              <li key={p.id} className="border-b border-white/10 pb-2">
                {p.status} · {p.kind} · {formatCents(p.amountCents)} · {p.user.email}
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen betalingen.</li>
          )}
        </ul>
      </section>

      {flags.length ? (
        <section>
          <h2 className="font-display text-3xl">Open fraud flags</h2>
          <ul className="mt-4 space-y-3">
            {flags.map((f) => (
              <li key={f.id} className="card-dark p-4 text-sm">
                <p>
                  {f.type} · {f.status} · {f.details}
                </p>
                <form action={reviewFraud} className="mt-2 flex gap-2">
                  <input type="hidden" name="id" value={f.id} />
                  <button name="status" value="reviewed" className="text-yellow">
                    Bekeken
                  </button>
                  <button name="status" value="dismissed" className="text-muted">
                    Wegcijferen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AdminChrome>
  );
}
