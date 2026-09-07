import { campaignHtml } from "@/lib/mail-template";
import { siteUrl } from "@/lib/mollie";

export const MAIL_VOORBEELD_SUBJECT = "Even een update van myurusdream.be";

export const MAIL_VOORBEELD_BODY = `{{aanhef}},

De teller staat live. Alleen bevestigde betalingen tellen.

Elke €2 is een eigen storting, zo vaak u wilt. Geen abonnement.

Klik op de knop hieronder om de stand te bekijken.

Groet,
myurusdream.be`;

export function sampleMailHtml() {
  return campaignHtml({
    subject: MAIL_VOORBEELD_SUBJECT,
    body: MAIL_VOORBEELD_BODY,
    base: siteUrl(),
    vars: { firstName: "Jan", lastName: "Peeters", email: "jan@voorbeeld.be" },
  });
}
