import { requireAdminPage } from "@/lib/admin";
import { AdminChrome, Kpi } from "@/components/AdminChrome";
import { getCampaign, getLiveTotals } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { uniqueVisitorCount, todayVisitorCount, onlineVisitorCount } from "@/lib/visitors";
import { reviewFraud, deletePayment, deleteFraudFlag } from "./actions";
import { Accordion } from "@/components/Accordion";

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

      <Accordion title="Recente betalingen" compact className="">
        <ul className="space-y-2 px-4 py-3 text-sm">
          {payments.length ? (
            payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0">
                <span>
                  {p.status} · {p.kind} · {formatCents(p.amountCents)} · {p.user.email}
                </span>
                <form action={deletePayment}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen betalingen.</li>
          )}
        </ul>
      </Accordion>

      <Accordion title="Open fraud flags" compact className="">
        <ul className="space-y-3 px-4 py-3">
          {flags.length ? (
            flags.map((f) => (
              <li key={f.id} className="border border-white/10 p-3 text-sm">
                <p>
                  {f.type} · {f.status} · {f.details}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <form action={reviewFraud}>
                    <input type="hidden" name="id" value={f.id} />
                    <button name="status" value="reviewed" className="btn-ghost">
                      Bekeken
                    </button>
                  </form>
                  <form action={deleteFraudFlag}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="btn-danger">
                      Verwijderen
                    </button>
                  </form>
                </div>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted">Geen open flags.</li>
          )}
        </ul>
      </Accordion>
    </AdminChrome>
  );
}
