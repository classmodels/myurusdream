import { requireAdminPage } from "@/lib/admin";
import { AdminChrome, Kpi } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { todayVisitorCount, uniqueVisitorCount, visitorsByDay, onlineVisitorCount } from "@/lib/visitors";

export const dynamic = "force-dynamic";

export default async function AdminBezoekersPage() {
  await requireAdminPage();
  const [days, total, today, online] = await Promise.all([
    visitorsByDay(30),
    uniqueVisitorCount(),
    todayVisitorCount(),
    onlineVisitorCount(),
  ]);
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <AdminChrome title="Bezoekers">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Totaal uniek" value={String(total)} />
        <Kpi label="Vandaag" value={String(today)} />
        <Kpi label="Nu live" value={String(online)} />
      </div>
      <Accordion title="Per dag (30 dagen)" compact className="">
        <ul className="space-y-2 px-4 py-3">
          {days.length ? (
            days.map((d) => (
              <li key={d.day} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="text-white/70">{d.day}</span>
                <span className="h-3 bg-white/10">
                  <span
                    className="block h-3 bg-yellow"
                    style={{ width: `${Math.max(4, (d.count / max) * 100)}%` }}
                  />
                </span>
                <span className="text-right text-yellow">{d.count}</span>
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen dagelijkse data. Die start vanaf deze update.</li>
          )}
        </ul>
      </Accordion>
    </AdminChrome>
  );
}
