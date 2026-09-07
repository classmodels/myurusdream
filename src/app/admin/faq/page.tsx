import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { Accordion } from "@/components/Accordion";
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

      <Accordion title="Vragen" compact className="">
        <div className="space-y-3 px-4 py-3">
          {faqs.length ? (
            faqs.map((f) => (
              <form key={f.id} action={saveFaq} className="grid gap-2 border border-white/10 p-3">
                <input type="hidden" name="id" value={f.id} />
                <input name="question" defaultValue={f.question} />
                <textarea name="answer" rows={3} defaultValue={f.answer} />
                <label className="flex items-center gap-2 normal-case tracking-normal">
                  <input type="checkbox" name="published" defaultChecked={f.published} className="w-auto" />{" "}
                  Gepubliceerd
                </label>
                <div className="flex flex-wrap gap-1">
                  <button type="submit" className="btn-ghost">
                    Opslaan
                  </button>
                  <button type="submit" formAction={deleteFaq} className="btn-danger">
                    Verwijderen
                  </button>
                </div>
              </form>
            ))
          ) : (
            <p className="text-sm text-muted">Nog geen vragen.</p>
          )}
        </div>
      </Accordion>
    </AdminChrome>
  );
}
