import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { AdminSponsorEditor } from "@/components/AdminSponsorEditor";
import { AdminManualPaymentForm } from "@/components/AdminManualPaymentForm";

export const dynamic = "force-dynamic";

export default async function AdminSponsorsPage() {
  await requireAdminPage();
  const rows = await prisma.payment.findMany({
    where: { kind: "sponsor", status: "paid" },
    orderBy: { paidAt: "desc" },
    include: { user: true },
  });

  const { publicUrlToRelative, readUpload } = await import("@/lib/uploads");
  const withLogoState = await Promise.all(
    rows.map(async (p) => {
      const relative = publicUrlToRelative(p.pixelImage);
      const logoOk = relative ? Boolean(await readUpload(relative)) : false;
      return { p, logoOk, logoMissing: Boolean(p.pixelImage) && !logoOk };
    }),
  );

  return (
    <AdminChrome title="Sponsors">
      <p className="text-sm text-muted">
        Betaalde sponsors. Ontbreekt een logo (rood), upload opnieuw en klik Opslaan — dan staat
        het in alle browsers gelijk. Of wis de sponsor volledig (logo + bedrag + account).
      </p>
      <Accordion title="Sponsor handmatig toevoegen (zonder Mollie)" compact className="mt-4">
        <div className="px-4 py-4">
          <AdminManualPaymentForm defaultKind="sponsor" />
        </div>
      </Accordion>
      <Accordion title="Sponsors bewerken" compact className="mt-4">
        <div className="divide-y divide-white/10">
          {withLogoState.map(({ p, logoMissing }) => (
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
                logoMissing,
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
