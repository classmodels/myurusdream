import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { getAdminReachRows } from "@/lib/reach";
import { VISITOR_GOAL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminPopulariteitPage() {
  await requireAdminPage();
  const rows = await getAdminReachRows();

  return (
    <AdminChrome title="Populariteit">
      <p className="text-sm text-muted">
        Overzicht van hoe ver uitnodigingen reiken. Rechtstreeks = mensen die via hun link €2
        stortten. Via via = diepere lijn (+1 eerpunten). Geen prijs — puur bereik en populariteit.
        Site-ambitie: {VISITOR_GOAL.toLocaleString("nl-BE")} bezoekers.
      </p>

      <Accordion title="Bereik per deelnemer" compact className="mt-6">
        <div className="overflow-x-auto px-4 py-3">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Naam</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">€2-stortingen</th>
                <th className="p-2">Rechtstreeks</th>
                <th className="p-2">Via via</th>
                <th className="p-2">Totaal bereik</th>
                <th className="p-2">Eerpunten</th>
                <th className="p-2">Ranking</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-2 text-yellow">{i + 1}</td>
                  <td className="p-2">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || `Deelnemer #${u.participantNumber}`}
                  </td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.paidContributions}</td>
                  <td className="p-2">{u.directPeople}</td>
                  <td className="p-2">{u.indirectEvents}</td>
                  <td className="p-2 text-yellow">{u.totalPeopleEstimate}</td>
                  <td className="p-2">{u.totalPoints}</td>
                  <td className="p-2">{u.rank ? `#${u.rank}` : "—"}</td>
                  <td className="p-2">
                    <a href={`/admin/deelnemer/${u.id}`} className="btn-ghost">
                      Open
                    </a>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="p-2 text-muted" colSpan={10}>
                    Nog geen bereikgegevens.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Accordion>
    </AdminChrome>
  );
}
