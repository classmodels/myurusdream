import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdminPage();
  const rows = await prisma.payment.findMany({
    where: { kind: "sponsor", status: "paid" },
    orderBy: { paidAt: "desc" },
    include: { user: true },
  });

  return (
    <AdminChrome title="Sponsors">
      <p className="text-sm text-muted">Betaalde sponsors met hun gegevens.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="p-2">Naam</th>
              <th className="p-2">Bedrijf</th>
              <th className="p-2">E-mail</th>
              <th className="p-2">GSM</th>
              <th className="p-2">Niveau</th>
              <th className="p-2">Bedrag</th>
              <th className="p-2">Website</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-2">
                  {p.sponsorName || [p.user.firstName, p.user.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="p-2">{p.user.companyName || "—"}</td>
                <td className="p-2">{p.user.email}</td>
                <td className="p-2">{p.user.phone || "—"}</td>
                <td className="p-2">{p.sponsorTier || "—"}</td>
                <td className="p-2">{formatCents(p.amountCents)}</td>
                <td className="p-2">
                  {p.sponsorUrl ? (
                    <a href={p.sponsorUrl} className="text-yellow" target="_blank" rel="noreferrer">
                      {p.sponsorUrl}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="p-2 text-muted" colSpan={7}>
                  Nog geen sponsors.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminChrome>
  );
}
