import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { deletePayment } from "../actions";

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
      <Accordion title="Sponsors" compact className="">
        <div className="overflow-x-auto px-4 py-3">
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
                <th className="p-2"></th>
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
                  <td className="p-2">
                    <form action={deletePayment}>
                      <input type="hidden" name="paymentId" value={p.id} />
                      <button type="submit" className="btn-danger">
                        Verwijderen
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="p-2 text-muted" colSpan={8}>
                    Nog geen sponsors.
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
