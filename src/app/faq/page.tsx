import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LegalStamp } from "@/components/LegalStamp";
import { PageHero } from "@/components/PageHero";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div className="pb-16">
      <PageHero compact kicker="Vragen" title="FAQ" image="/images/urus-detail.png">
        <p>Korte antwoorden, in dezelfde taal als de rest van de site. Klik een vraag open.</p>
      </PageHero>
      <div className="mx-auto max-w-3xl px-5 pt-6">
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((f) => (
            <details key={f.id} className="group py-1.5">
              <summary className="relative block cursor-pointer py-0.5 pr-6 text-[0.8rem] font-medium uppercase tracking-[0.08em] marker:content-none [&::-webkit-details-marker]:hidden">
                {f.question}
                <span
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[0.55rem] text-white/35 transition group-open:rotate-90"
                  aria-hidden
                >
                  ▶
                </span>
              </summary>
              <p className="mt-1.5 max-w-prose pb-1.5 text-[0.8rem] font-normal normal-case tracking-normal text-white/70">
                {f.answer}
              </p>
              {f.legalReview ? (
                <div className="mb-1.5">
                  <LegalStamp className="!px-2 !py-1 !text-[0.55rem]" />
                </div>
              ) : null}
            </details>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/meedoen" className="btn-yellow">
            Ik doe mee voor €2
          </Link>
          <Link href="/voorwaarden" className="btn-ghost">
            Voorwaarden
          </Link>
        </div>
      </div>
    </div>
  );
}
