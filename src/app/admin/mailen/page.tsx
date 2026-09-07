import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { getSmtpConfig, smtpReady } from "@/lib/mail";
import {
  createMailList,
  deleteMailCampaign,
  deleteMailList,
  importMailList,
  saveSmtp,
  sendBroadcast,
  sendMailCampaign,
  sendTestMail,
} from "../actions";
import { Accordion } from "@/components/Accordion";

export const dynamic = "force-dynamic";

export default async function AdminMailenPage() {
  await requireAdminPage();
  const smtp = await getSmtpConfig();
  const lists = await prisma.mailList.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true } } },
  });
  const campaigns = await prisma.mailCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

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
            <input name="user" defaultValue={smtp.user} placeholder="b6d3b2001@smtp-brevo.com" />
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
        <form action={sendTestMail} className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1">
            Testmail naar
            <input name="to" placeholder="uw@adres.be" className="max-w-xs" />
          </label>
          <button className="btn-ghost">Testmail sturen</button>
        </form>
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Lijsten importeren</h2>
        <form action={createMailList} className="flex flex-wrap gap-2">
          <input name="name" placeholder="Naam van de lijst" required />
          <button className="btn-ghost">Lijst maken</button>
        </form>
        <form action={importMailList} className="grid gap-3">
          <select name="listId">
            <option value="">Nieuwe lijst</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l._count.contacts})
              </option>
            ))}
          </select>
          <input name="newName" placeholder="Naam als u een nieuwe lijst maakt" />
          <textarea
            name="csv"
            rows={6}
            placeholder={"email;voornaam;naam\njan@voorbeeld.be;Jan;Peeters"}
            required
          />
          <button className="btn-yellow w-fit">CSV importeren</button>
        </form>
      </section>

      <Accordion title="Lijsten" compact className="">
        <ul className="space-y-2 px-4 py-3 text-sm">
          {lists.length ? (
            lists.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0">
                <span>
                  {l.name} · {l._count.contacts} adressen
                </span>
                <form action={deleteMailList}>
                  <input type="hidden" name="listId" value={l.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen lijsten.</li>
          )}
        </ul>
      </Accordion>

      <Accordion title="Voorbeeld van de mail" compact className="">
        <div className="px-4 py-4">
          <p className="mb-3 text-sm text-muted">
            Zo ziet een mail eruit in het gele sjabloon. De tekst die u typt komt in het crème
            middenstuk.
          </p>
          <iframe
            title="Voorbeeldmail"
            src="/admin/mailen/voorbeeld"
            className="h-[520px] w-full border border-white/10 bg-black"
          />
        </div>
      </Accordion>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Nieuwe mail</h2>
        <p className="text-sm text-muted">
          Placeholders: {"{{voornaam}}"} {"{{naam}}"} {"{{volledige_naam}}"} {"{{email}}"} {"{{aanhef}}"}
        </p>
        <form action={sendMailCampaign} className="grid gap-3">
          <select name="audience" required>
            <option value="accounts">Alle accounts</option>
            {lists.map((l) => (
              <option key={l.id} value={`list:${l.id}`}>
                Lijst: {l.name}
              </option>
            ))}
            <option value="manual">Plak adressen / CSV</option>
          </select>
          <textarea name="manual" rows={3} placeholder="Alleen nodig bij ‘Plak adressen’" />
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

      <Accordion title="Verzonden" compact className="">
        <ul className="space-y-2 px-4 py-3 text-sm">
          {campaigns.length ? (
            campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0">
                <span>
                  {c.subject} · {c.sentCount} ok · {c.failCount} mislukt ·{" "}
                  {c.sentAt?.toLocaleString("nl-BE") || "—"}
                </span>
                <form action={deleteMailCampaign}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen verzonden mails.</li>
          )}
        </ul>
      </Accordion>
    </AdminChrome>
  );
}
