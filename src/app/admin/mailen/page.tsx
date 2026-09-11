import Link from "next/link";
import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { getSmtpConfig, smtpReady } from "@/lib/mail";
import { createMailList, deleteMailCampaign, deleteMailList, saveSmtp, sendBroadcast, sendMailCampaign } from "../actions";
import { Accordion } from "@/components/Accordion";
import { TestMailForm } from "./TestMailForm";
import { MailCsvImportForm } from "@/components/MailCsvImportForm";
import { MailSelectAll } from "@/components/MailSelectAll";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function AdminMailenPage() {
  await requireAdminPage();
  const smtp = await getSmtpConfig();
  const lists = await prisma.mailList.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true } } },
  });
  const campaigns = await prisma.mailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { _count: { select: { sends: true } } },
  });
  const campaignStats = await Promise.all(
    campaigns.map(async (c) => {
      const [opened, read] = await Promise.all([
        prisma.mailSend.count({ where: { campaignId: c.id, openedAt: { not: null } } }),
        prisma.mailSend.count({ where: { campaignId: c.id, readAt: { not: null } } }),
      ]);
      return { ...c, opened, read };
    }),
  );

  return (
    <AdminChrome title="Mailen">
      <p className="text-sm text-muted">
        Campagnes gaan via dezelfde dienst als ModelPort: <strong>Brevo</strong> (
        <code>smtp-relay.brevo.com</code>, poort 587). U typt de mail hier; Brevo is de postbode.
        Afzender blijft <strong>myurusdream.be &lt;info@myurusdream.be&gt;</strong> — die moet in
        hetzelfde Brevo-account als afzender staan (niet hello@modelport.be).
        Wachtwoord = de <strong>SMTP-sleutel</strong> in Brevo (begint vaak met xsmtpsib-), niet het
        inlogwachtwoord van de mailbox.
      </p>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">SMTP (Brevo)</h2>
        <p className="text-sm text-muted">
          {smtpReady(smtp) ? `Klaar · ${smtp.user} · ${smtp.host}` : "Nog niet ingesteld — plak de Brevo SMTP-sleutel."}
        </p>
        <form action={saveSmtp} className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            Host
            <input name="host" defaultValue={smtp.host} placeholder="smtp-relay.brevo.com" />
          </label>
          <label className="grid gap-1">
            Poort
            <input name="port" defaultValue={String(smtp.port)} placeholder="587" />
          </label>
          <label className="grid gap-1">
            Gebruikersnaam
            <input name="user" defaultValue={smtp.user || "b6d3b2001@smtp-brevo.com"} placeholder="b6d3b2001@smtp-brevo.com" />
          </label>
          <label className="grid gap-1">
            Wachtwoord
            <input name="pass" type="password" placeholder={smtp.pass ? "•••• (leeg = behouden)" : "Brevo SMTP-sleutel"} />
          </label>
          <label className="grid gap-1 md:col-span-2">
            Afzender
            <input name="from" defaultValue={smtp.from} placeholder="myurusdream.be <info@myurusdream.be>" />
          </label>
          <button className="btn-yellow w-fit">SMTP opslaan</button>
        </form>
        <TestMailForm />
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Lijsten importeren</h2>
        <form action={createMailList} className="flex flex-wrap gap-2">
          <input name="name" placeholder="Naam van de lijst" required />
          <button className="btn-ghost">Lijst maken</button>
        </form>
        <MailCsvImportForm
          lists={lists.map((l) => ({ id: l.id, name: l.name, count: l._count.contacts }))}
        />
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Lijsten</h2>
        {lists.length ? (
          <ul className="space-y-2 text-sm">
            {lists.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0"
              >
                <Link href={`/admin/mailen/lijst/${l.id}`} className="hover:text-yellow">
                  {l.name} · {l._count.contacts} adressen — openen
                </Link>
                <form action={deleteMailList}>
                  <input type="hidden" name="listId" value={l.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nog geen lijsten. Maak er een of importeer een CSV.</p>
        )}
      </section>

      <Accordion title="Voorbeeld van de mail" compact className="">
        <div className="px-4 py-4">
          <p className="mb-3 text-sm text-muted">
            Zo ziet een mail eruit in het champagne-sjabloon. De tekst die u typt komt in het
            donkere middenstuk, tussen de header en de footer van het ontwerp.
          </p>
          <iframe
            title="Voorbeeldmail"
            src="/admin/mailen/voorbeeld"
            className="h-[860px] w-full border border-white/10 bg-black"
          />
        </div>
      </Accordion>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Nieuwe mail</h2>
        <p className="text-sm text-muted">
          Placeholders: {"{{voornaam}}"} {"{{naam}}"} {"{{volledige_naam}}"} {"{{bedrijf}}"} {"{{email}}"}{" "}
          {"{{aanhef}}"}
        </p>
        <form action={sendMailCampaign} className="grid gap-3">
          <div className="space-y-2 border border-white/10 p-3">
            <MailSelectAll checkboxName="listIds" label="Alles selecteren" />
            <label className="flex items-center gap-2 text-sm normal-case tracking-normal">
              <input type="checkbox" name="accounts" className="w-auto" />
              Alle accounts op de site
            </label>
            {lists.map((l) => (
              <label key={l.id} className="flex items-center gap-2 text-sm normal-case tracking-normal">
                <input type="checkbox" name="listIds" value={l.id} defaultChecked className="w-auto" />
                {l.name} ({l._count.contacts})
              </label>
            ))}
            {!lists.length ? <p className="text-sm text-muted">Nog geen lijsten om te selecteren.</p> : null}
          </div>
          <input name="subject" placeholder="Onderwerp" required />
          <textarea name="body" rows={8} placeholder="Typ hier de tekst. Die komt in het myurusdream-sjabloon." required />
          <button className="btn-yellow w-fit">Versturen</button>
        </form>
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Push naar de app</h2>
        <form action={sendBroadcast} className="grid gap-3">
          <input name="title" placeholder="Titel" required />
          <textarea name="body" rows={3} placeholder="Tekst" required />
          <input name="url" defaultValue="/" placeholder="Link, bv. /dashboard" />
          <button className="btn-ghost w-fit">Push versturen</button>
        </form>
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Verzonden</h2>
        {campaignStats.length ? (
          <ul className="space-y-2 text-sm">
            {campaignStats.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0"
              >
                <Link href={`/admin/mailen/campagne/${c.id}`} className="hover:text-yellow">
                  {c.subject} · {c.sentCount} ontvangen · {c.opened} geopend · {c.read} gelezen ·{" "}
                  {c.failCount} mislukt · {c.sentAt?.toLocaleString("nl-BE") || "—"}
                </Link>
                <form action={deleteMailCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nog geen verzonden mails.</p>
        )}
      </section>
    </AdminChrome>
  );
}
