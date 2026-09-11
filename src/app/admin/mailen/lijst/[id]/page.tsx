import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { deleteMailContact, sendMailCampaign } from "../../../actions";
import { MailAddContactForm } from "@/components/MailAddContactForm";
import { MailCsvImportForm } from "@/components/MailCsvImportForm";
import { MailSelectAll } from "@/components/MailSelectAll";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function AdminMailListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ imported?: string; total?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const q = await searchParams;
  const list = await prisma.mailList.findUnique({
    where: { id },
    include: { contacts: { orderBy: { createdAt: "desc" } } },
  });
  if (!list) notFound();
  const lists = await prisma.mailList.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contacts: true } } },
  });

  return (
    <AdminChrome title={list.name}>
      <p className="text-sm text-muted">
        <Link href="/admin/mailen" className="hover:text-yellow">
          ← Mailen
        </Link>{" "}
        · {list.contacts.length} adressen
      </p>
      {q.imported ? (
        <p className="text-sm text-yellow">
          {q.imported} nieuwe adressen geïmporteerd
          {q.total ? ` van ${q.total} rijen in het bestand` : ""}.
        </p>
      ) : null}

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Adres toevoegen</h2>
        <MailAddContactForm listId={list.id} />
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">CSV in deze lijst</h2>
        <MailCsvImportForm
          defaultListId={list.id}
          lists={lists.map((l) => ({ id: l.id, name: l.name, count: l._count.contacts }))}
        />
      </section>

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Adressen</h2>
        {list.contacts.length ? (
          <div className="space-y-4">
            <form id="send-list-mail" action={sendMailCampaign} className="space-y-4">
              <input type="hidden" name="listId" value={list.id} />
              <MailSelectAll checkboxName="contactIds" label="Alles selecteren" />
            </form>
            <ul className="max-h-[28rem] space-y-1 overflow-auto text-sm">
              {list.contacts.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 py-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2 normal-case tracking-normal">
                    <input
                      form="send-list-mail"
                      type="checkbox"
                      name="contactIds"
                      value={c.id}
                      defaultChecked
                      className="w-auto"
                    />
                    <span className="truncate">
                      {c.company || [c.firstName, c.lastName].filter(Boolean).join(" ") || "—"} · {c.email}
                    </span>
                  </label>
                  <form action={deleteMailContact}>
                    <input type="hidden" name="listId" value={list.id} />
                    <input type="hidden" name="contactId" value={c.id} />
                    <button type="submit" className="btn-danger">
                      Weg
                    </button>
                  </form>
                </li>
              ))}
            </ul>
            <div className="grid gap-3">
              <input form="send-list-mail" name="subject" placeholder="Onderwerp" required />
              <textarea
                form="send-list-mail"
                name="body"
                rows={6}
                placeholder="Typ de mail. Placeholders: {{voornaam}} {{bedrijf}} {{email}}"
                required
              />
              <button form="send-list-mail" className="btn-yellow w-fit">
                Mail naar selectie versturen
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Nog geen adressen. Voeg er één toe of importeer een CSV.</p>
        )}
      </section>
    </AdminChrome>
  );
}
