import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPixelsPage() {
  await requireAdminPage();
  const rows = await prisma.payment.findMany({
    where: { kind: "pixel", status: "paid" },
    orderBy: { paidAt: "desc" },
    include: { user: true },
  });

  return (
    <AdminChrome title="Pixelwall">
      <p className="text-sm text-muted">Betaalde pixels met eigenaar en plaats op de muur.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="p-2">Voornaam</th>
              <th className="p-2">Naam</th>
              <th className="p-2">E-mail</th>
              <th className="p-2">GSM</th>
              <th className="p-2">Label</th>
              <th className="p-2">Vak</th>
              <th className="p-2">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="p-2">{p.user.firstName || "—"}</td>
                <td className="p-2">{p.user.lastName || "—"}</td>
                <td className="p-2">{p.user.email}</td>
                <td className="p-2">{p.user.phone || "—"}</td>
                <td className="p-2">{p.pixelLabel || p.sponsorName || "—"}</td>
                <td className="p-2 whitespace-nowrap">
                  {p.pixelX != null && p.pixelY != null
                    ? `${p.pixelX},${p.pixelY} · ${p.pixelW || 1}×${p.pixelH || 1}`
                    : "—"}
                </td>
                <td className="p-2">{formatCents(p.amountCents)}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="p-2 text-muted" colSpan={7}>
                  Nog geen pixels.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminChrome>
  );
}
