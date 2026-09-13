import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { prisma } from "@/lib/prisma";
import { blockUser, deleteUser } from "../actions";

export const dynamic = "force-dynamic";

function when(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleString("nl-BE", { timeZone: "Europe/Brussels" });
}

export default async function AdminAccountsPage() {
  await requireAdminPage();
  const users = await prisma.user.findMany({
    where: { role: "participant" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminChrome title="Accounts">
      <p className="text-sm text-muted">
        Alle accounts: voornaam, naam, gsm, mail, laatste bezoek. Deactiveren blokkeert login.
        Verwijderen wist persoonsgegevens; betaalde accounts worden geanonimiseerd zodat de teller klopt.
      </p>
      <Accordion title="Accounts" compact className="">
        <div className="overflow-x-auto px-4 py-3">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="p-2">Voornaam</th>
                <th className="p-2">Naam</th>
                <th className="p-2">GSM</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">Laatst op de site</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-2">{u.firstName || "—"}</td>
                  <td className="p-2">{u.lastName || "—"}</td>
                  <td className="p-2">{u.phone || "—"}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2 whitespace-nowrap">{when(u.lastSeenAt)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <a href={`/admin/deelnemer/${u.id}`} className="btn-ghost">
                        Open
                      </a>
                      <form action={blockUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className="btn-ghost">
                          {u.blocked ? "Activeer" : "Deactiveer"}
                        </button>
                      </form>
                      <form action={deleteUser}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button type="submit" className="btn-danger">
                          Verwijderen
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="p-2 text-muted" colSpan={6}>
                    Nog geen accounts.
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
