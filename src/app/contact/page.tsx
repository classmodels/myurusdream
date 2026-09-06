import { LegalPage } from "@/components/LegalPage";
import { getCampaign } from "@/lib/campaign";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const campaign = await getCampaign();
  return (
    <LegalPage title="Contact en organisator">
      <p>Verantwoordelijke organisator van deze persoonlijke campagne:</p>
      <p>
        Naam: {campaign.organizerName || "Nog in te vullen"}
        <br />
        Onderneming: {campaign.organizerCompany || "Nog in te vullen"}
        <br />
        Adres: {campaign.organizerAddress || "Nog in te vullen"}
        <br />
        E-mail: {campaign.organizerEmail || "admin@myurusdream.be"}
        <br />
        BTW: {campaign.vatNumber || "Nog in te vullen"}
      </p>
      <p>
        Deze gegevens moeten volledig zijn vóór LIVE-publicatie (zie publicatiecheck in het
        adminpaneel).
      </p>
    </LegalPage>
  );
}
