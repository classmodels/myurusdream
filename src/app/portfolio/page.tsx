import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { portfolio, reviews } from "@/lib/content";

export const metadata: Metadata = {
  title: "Referenties",
  description: "Cases en klantresultaten van SiteButler in uiteenlopende branches.",
};

export default function PortfolioPage() {
  return (
    <>
      <section className="mesh-hero">
        <div className="container-x py-10 md:py-20">
          <p className="eyebrow">Referenties</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Projecten met concrete resultaten.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Van lokale ondernemingen tot corporate organisaties — telkens met focus op
            duidelijkheid, geloofwaardigheid en conversie.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x grid gap-5 md:grid-cols-2">
          {portfolio.map((item, i) => (
            <article key={item.title} className={`card overflow-hidden ${["card-blue", "card-teal", "card-green", "card-coral", "card-blue", "card-teal"][i % 6]}`}>
              <div
                className={`flex h-40 items-end p-6 ${
                  [
                    "bg-gradient-to-br from-blue to-teal",
                    "bg-gradient-to-br from-teal-deep to-green",
                    "bg-gradient-to-br from-blue-deep to-[#1e293b]",
                    "bg-gradient-to-br from-green to-teal",
                    "bg-gradient-to-br from-[#1d4ed8] to-teal",
                    "bg-gradient-to-br from-[#0f766e] to-blue",
                  ][i % 6]
                }`}
              >
                <div>
                  <p className="text-xs font-bold tracking-wider text-white/85 uppercase">{item.sector}</p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                    {item.title}
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <p className="font-semibold text-teal-deep">{item.result}</p>
                <p className="mt-2 text-sm text-muted-on-light">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span key={t} className="rounded-md bg-blue-soft px-2.5 py-1 text-xs font-bold text-blue-deep">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-bg-alt pt-0">
        <div className="container-x">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">Klantfeedback</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviews.map((r, i) => (
              <blockquote key={r.name} className={`card p-6 ${["card-blue", "card-teal", "card-green", "card-coral"][i % 4]}`}>
                <p className="text-sm font-bold tracking-wide text-blue-deep uppercase">Beoordeling 5/5</p>
                <p className="mt-3 text-ink-on-light">&ldquo;{r.quote}&rdquo;</p>
                <footer className="mt-4 border-t border-[#dbe4f0] pt-4">
                  <p className="font-bold text-ink-on-light">{r.name}</p>
                  <p className="text-sm text-muted-on-light">{r.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
