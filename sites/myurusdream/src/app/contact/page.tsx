import { LegalPage } from "@/components/LegalPage";
import { getCampaign } from "@/lib/campaign";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const dict = await getDictionary();
  const campaign = await getCampaign();
  return (
    <LegalPage title={dict.contact.title}>
      <p>{dict.contact.lead}</p>
      <p>
        {campaign.organizerName || "—"}
        <br />
        {campaign.organizerCompany || "—"}
        <br />
        {campaign.organizerAddress || "—"}
        <br />
        {dict.contact.emailLabel}: {campaign.organizerEmail || "admin@myurusdream.be"}
        <br />
        {campaign.vatNumber || "—"}
      </p>
    </LegalPage>
  );
}
