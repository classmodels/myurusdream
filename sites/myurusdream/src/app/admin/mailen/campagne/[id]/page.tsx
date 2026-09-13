import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { AdminChrome, Kpi } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function stamp(d: Date | null) {
  return d ? d.toLocaleString("nl-BE") : "—";
}

export default async function AdminMailCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const campaign = await prisma.mailCampaign.findUnique({
    where: { id },
    include: { sends: { orderBy: { email: "asc" } } },
  });
  if (!campaign) notFound();
  const received = campaign.sends.filter((s) => s.status === "sent").length;
  const opened = campaign.sends.filter((s) => s.openedAt).length;
  const read = campaign.sends.filter((s) => s.readAt).length;
  const failed = campaign.sends.filter((s) => s.status === "failed").length;

  return (
    <AdminChrome title={campaign.subject}>
      <p className="text-sm text-muted">
        <Link href="/admin/mailen" className="hover:text-yellow">
          ← Mailen
        </Link>{" "}
        · {campaign.audience} · {campaign.sentAt?.toLocaleString("nl-BE") || "—"}
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Ontvangen" value={String(received)} />
        <Kpi label="Geopend" value={String(opened)} />
        <Kpi label="Gelezen" value={String(read)} />
        <Kpi label="Mislukt" value={String(failed)} />
      </div>
      <section className="card-dark space-y-3 overflow-x-auto p-6">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-muted">
            <tr>
              <th className="pb-2 pr-3">Adres</th>
              <th className="pb-2 pr-3">Naam / bedrijf</th>
              <th className="pb-2 pr-3">Ontvangen</th>
              <th className="pb-2 pr-3">Geopend</th>
              <th className="pb-2">Gelezen</th>
            </tr>
          </thead>
          <tbody>
            {campaign.sends.map((s) => (
              <tr key={s.id} className="border-t border-white/10">
                <td className="py-2 pr-3">{s.email}</td>
                <td className="py-2 pr-3">
                  {s.company || [s.firstName, s.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="py-2 pr-3">{s.status === "sent" ? stamp(s.sentAt) : s.error || "mislukt"}</td>
                <td className="py-2 pr-3">{stamp(s.openedAt)}</td>
                <td className="py-2">{stamp(s.readAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!campaign.sends.length ? (
          <p className="text-sm text-muted">Geen ontvangstgegevens voor deze oudere mail.</p>
        ) : null}
      </section>
    </AdminChrome>
  );
}
