import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { getCampaign, parseMoneyBreakdown } from "@/lib/campaign";
import { getShareCopy } from "@/lib/share";
import { SHARE_TEXT, SITE_NAME } from "@/lib/constants";
import { createUpdate, saveMoneyBreakdown, saveOrganizer, saveShareCopy } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminCampagnePage() {
  await requireAdminPage();
  const campaign = await getCampaign();
  const shareCopy = await getShareCopy();
  const lines = parseMoneyBreakdown(campaign.moneyBreakdownJson);

  return (
    <AdminChrome title="Campagne">
      <section className="card-dark space-y-3 p-6">
        <h2 className="font-display text-2xl">Organisator & verhaal</h2>
        <form action={saveOrganizer} className="grid gap-3">
          <input name="organizerName" defaultValue={campaign.organizerName} placeholder="Naam" />
          <input name="organizerEmail" defaultValue={campaign.organizerEmail} placeholder="E-mail" />
          <input name="organizerAddress" defaultValue={campaign.organizerAddress} placeholder="Adres" />
          <input name="organizerCompany" defaultValue={campaign.organizerCompany} placeholder="Onderneming" />
          <input name="vatNumber" defaultValue={campaign.vatNumber} placeholder="BTW" />
          <textarea name="storyText" rows={8} defaultValue={campaign.storyText} />
          <button className="btn-yellow w-fit">Opslaan</button>
        </form>
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Geld-uitsplitsing</h2>
        <p className="text-sm text-muted">
          Dit was eerder een JSON-blok. U vult nu gewoon de posten in (label, bedrag in euro, nota).
          Dynamische rijen (bruto / rest) rekent de site zelf.
        </p>
        <form action={saveMoneyBreakdown} className="space-y-4">
          {lines.map((line) => (
            <div key={line.key} className="grid gap-2 border border-white/10 p-3 md:grid-cols-3">
              <input type="hidden" name="key" value={line.key} />
              <input type="hidden" name="dynamic" value={line.dynamic ? "1" : "0"} />
              <input name="label" defaultValue={line.label} placeholder="Post" />
              <input
                name="euros"
                defaultValue={line.dynamic ? "" : (line.cents / 100).toFixed(2)}
                placeholder={line.dynamic ? "automatisch" : "0.00"}
                readOnly={line.dynamic}
              />
              <input name="note" defaultValue={line.note || ""} placeholder="Nota" />
              {line.dynamic ? <p className="text-xs text-muted md:col-span-3">Deze lijn wordt automatisch berekend.</p> : null}
            </div>
          ))}
          <div className="grid gap-2 border border-dashed border-yellow/40 p-3 md:grid-cols-3">
            <input name="newLabel" placeholder="Nieuwe post" />
            <input name="newEuros" placeholder="Bedrag in €" />
            <input name="newNote" placeholder="Nota" />
          </div>
          <button className="btn-yellow w-fit">Uitsplitsing opslaan</button>
        </form>
      </section>

      <section className="card-dark space-y-3 p-6">
        <h2 className="font-display text-2xl">Tekst bij doorsturen</h2>
        <form action={saveShareCopy} className="grid gap-3">
          <input name="subject" defaultValue={shareCopy.subject} placeholder={`Onderwerp, bv. ${SITE_NAME}`} />
          <textarea name="text" rows={5} defaultValue={shareCopy.text || SHARE_TEXT} required />
          <button className="btn-ghost w-fit">Deeltekst opslaan</button>
        </form>
      </section>

      <section className="card-dark space-y-3 p-6">
        <h2 className="font-display text-2xl">Nieuwe update</h2>
        <form action={createUpdate} className="grid gap-3">
          <input name="title" placeholder="Titel" required />
          <textarea name="body" rows={4} placeholder="Tekst" required />
          <label className="flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" name="published" defaultChecked className="w-auto" /> Publiceren
          </label>
          <button className="btn-yellow w-fit">Plaatsen</button>
        </form>
      </section>
    </AdminChrome>
  );
}
