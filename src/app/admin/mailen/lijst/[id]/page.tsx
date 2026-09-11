import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { MailAddContactForm } from "@/components/MailAddContactForm";
import { MailCsvImportForm } from "@/components/MailCsvImportForm";
import { MailComposeForm } from "@/components/MailComposeForm";

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
        <h2 className="font-display text-2xl">Mail versturen</h2>
        {list.contacts.length ? (
          <MailComposeForm
            listId={list.id}
            contacts={list.contacts.map((c) => ({
              id: c.id,
              email: c.email,
              label: `${c.company || [c.firstName, c.lastName].filter(Boolean).join(" ") || "—"} · ${c.email}`,
            }))}
          />
        ) : (
          <p className="text-sm text-muted">Nog geen adressen. Voeg er één toe of importeer een CSV.</p>
        )}
      </section>
    </AdminChrome>
  );
}
