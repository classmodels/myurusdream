import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { prisma } from "@/lib/prisma";
import { createFaq, deleteFaq, saveFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  await requireAdminPage();
  const faqs = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <AdminChrome title="FAQ">
      <section className="card-dark space-y-3 p-6">
        <h2 className="font-display text-2xl">Nieuwe vraag</h2>
        <form action={createFaq} className="grid gap-3">
          <input name="question" placeholder="Vraag" required />
          <textarea name="answer" rows={3} placeholder="Antwoord" required />
          <label className="flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" name="published" defaultChecked className="w-auto" /> Gepubliceerd
          </label>
          <button className="btn-yellow w-fit">Toevoegen</button>
        </form>
      </section>

      <div className="space-y-4">
        {faqs.map((f) => (
          <form key={f.id} action={saveFaq} className="card-dark grid gap-2 p-4">
            <input type="hidden" name="id" value={f.id} />
            <input name="question" defaultValue={f.question} />
            <textarea name="answer" rows={3} defaultValue={f.answer} />
            <label className="flex items-center gap-2 normal-case tracking-normal">
              <input type="checkbox" name="published" defaultChecked={f.published} className="w-auto" />{" "}
              Gepubliceerd
            </label>
            <div className="flex flex-wrap gap-3">
              <button className="btn-ghost w-fit">Opslaan</button>
              <button formAction={deleteFaq} className="text-sm text-red-400">
                Verwijderen
              </button>
            </div>
          </form>
        ))}
      </div>
    </AdminChrome>
  );
}
