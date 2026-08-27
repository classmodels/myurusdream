import { prisma } from "@/lib/prisma";
import { LegalStamp } from "@/components/LegalStamp";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-28">
      <h1 className="font-display text-5xl">FAQ</h1>
      <p className="mt-4 text-white/70">
        Antwoorden met een stempel moeten nog juridisch nagekeken worden voor publicatie.
      </p>
      <div className="mt-10 divide-y divide-white/10">
        {faqs.map((f) => (
          <details key={f.id} className="py-5">
            <summary className="cursor-pointer font-display text-2xl">{f.question}</summary>
            <p className="mt-3 text-white/75">{f.answer}</p>
            {f.legalReview ? (
              <div className="mt-3">
                <LegalStamp />
              </div>
            ) : null}
          </details>
        ))}
      </div>
    </div>
  );
}
