import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { getSmtpConfig, smtpReady } from "@/lib/mail";
import {
  createMailList,
  importMailList,
  saveSmtp,
  sendBroadcast,
  sendMailCampaign,
  sendTestMail,
} from "../actions";

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
        Zelfde soort dienst als ModelPort: Combell MailProtect (`smtp-auth.mailprotect.be`). Gebruik
        een mailbox op <strong>myurusdream.be</strong> (niet hello@modelport.be). SPF/DKIM van dit
        domein moet kloppen. De tekst die u typt gaat in het gele myurusdream-sjabloon.
      </p>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">SMTP</h2>
        <p className="text-sm text-muted">
          {smtpReady(smtp) ? `Klaar · ${smtp.user} · ${smtp.host}` : "Nog niet ingesteld."}
        </p>
        <form action={saveSmtp} className="grid gap-3 md:grid-cols-2">
          <input name="host" defaultValue={smtp.host} placeholder="smtp-auth.mailprotect.be" />
          <input name="port" defaultValue={String(smtp.port)} placeholder="587" />
          <input name="user" defaultValue={smtp.user} placeholder="info@myurusdream.be" />
          <input name="pass" type="password" placeholder={smtp.pass ? "•••• (leeg = behouden)" : "Wachtwoord"} />
          <input name="from" defaultValue={smtp.from} className="md:col-span-2" placeholder="myurusdream.be <info@myurusdream.be>" />
          <button className="btn-yellow w-fit">SMTP opslaan</button>
        </form>
        <form action={sendTestMail} className="flex flex-wrap gap-2">
          <input name="to" placeholder="test@adres.be" className="max-w-xs" />
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
        <ul className="text-sm text-white/70">
          {lists.map((l) => (
            <li key={l.id}>
              {l.name} · {l._count.contacts} adressen
            </li>
          ))}
        </ul>
      </section>

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

      {campaigns.length ? (
        <section>
          <h2 className="font-display text-2xl">Verzonden</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {campaigns.map((c) => (
              <li key={c.id} className="border-b border-white/10 pb-2">
                {c.subject} · {c.sentCount} ok · {c.failCount} mislukt ·{" "}
                {c.sentAt?.toLocaleString("nl-BE") || "—"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AdminChrome>
  );
}
