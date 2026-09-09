import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { AdminSponsorEditor } from "@/components/AdminSponsorEditor";

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
      <p className="text-sm text-muted">
        Betaalde sponsors. Upload hier een logo en klik Opslaan, of wis de sponsor volledig (logo +
        bedrag uit de teller + account). Logos blijven nu in de database bewaard, ook na een
        pipeline.
      </p>
      <Accordion title="Sponsors bewerken" compact className="mt-4">
        <div className="divide-y divide-white/10">
          {rows.map((p) => (
            <AdminSponsorEditor
              key={p.id}
              row={{
                id: p.id,
                sponsorName: p.sponsorName,
                sponsorUrl: p.sponsorUrl,
                sponsorTier: p.sponsorTier,
                pixelImage: p.pixelImage,
                pixelLabel: p.pixelLabel,
                amountLabel: formatCents(p.amountCents),
                email: p.user.email,
                phone: p.user.phone,
                companyName: p.user.companyName,
              }}
            />
          ))}
          {rows.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Nog geen sponsors.</p>
          ) : null}
        </div>
      </Accordion>
    </AdminChrome>
  );
}
