import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
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
      <div className="overflow-x-auto">
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
                <td className="p-2 whitespace-nowrap">
                  <a href={`/admin/deelnemer/${u.id}`} className="text-yellow">
                    Open
                  </a>
                  {" · "}
                  <form action={blockUser} className="inline">
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="text-yellow">{u.blocked ? "Activeer" : "Deactiveer"}</button>
                  </form>
                  {" · "}
                  <form action={deleteUser} className="inline">
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="text-red-400">Verwijder</button>
                  </form>
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
    </AdminChrome>
  );
}
