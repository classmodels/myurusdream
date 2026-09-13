import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { LegalStamp } from "@/components/LegalStamp";
import { PageHero } from "@/components/PageHero";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const dict = await getDictionary();
  const locale = await getLocale();
  const dbFaqs =
    locale === "nl"
      ? await prisma.faqItem.findMany({
          where: { published: true },
          orderBy: { sortOrder: "asc" },
        })
      : [];
  const faqs =
    locale === "nl" && dbFaqs.length > 0
      ? dbFaqs.map((f) => ({
          id: String(f.id),
          question: f.question,
          answer: f.answer,
          legalReview: f.legalReview,
        }))
      : dict.faq.items.map((f, i) => ({
          id: `dict-${i}`,
          question: f.q,
          answer: f.a,
          legalReview: false,
        }));

  return (
    <div className="pb-16">
      <PageHero compact kicker={dict.faq.kicker} title={dict.faq.title} image="/images/urus-detail.png">
        <p>{dict.faq.intro}</p>
      </PageHero>
      <div className="mx-auto max-w-7xl px-5 pt-6">
        <div className="max-w-3xl">
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
            {dict.common.meedoen}
          </Link>
          <Link href="/voorwaarden" className="btn-ghost">
            {dict.legalLinks.terms}
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
