import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { portfolio, reviews } from "@/lib/content";

export const metadata: Metadata = {
  title: "Referenties",
  description:
    "Voorbeeldprojecten van SiteButler: Class-Models, ModelPort, Class Date en meer — van brochure tot platform en app.",
};

export default function PortfolioPage() {
  return (
    <>
      <section className="mesh-hero">
        <div className="container-x py-10 md:py-20">
          <p className="eyebrow">Referenties</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Van visitekaartje tot volledig platform.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Drie live voorbeelden tonen wat mogelijk is: een modellenbureau met portalen,
            een marktplaats voor de sector, en een datingsite mét app. Klik door en oordeel zelf.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x grid gap-6">
          {portfolio.map((item, i) => (
            <article
              key={item.title}
              className={`card overflow-hidden ${["card-blue", "card-teal", "card-green", "card-coral", "card-blue", "card-teal", "card-purple", "card-mix"][i % 8]}`}
            >
              <div
                className={`flex min-h-36 items-end p-6 ${
                  [
                    "bg-gradient-to-br from-blue to-teal",
                    "bg-gradient-to-br from-teal-deep to-green",
                    "bg-gradient-to-br from-coral to-blue",
                    "bg-gradient-to-br from-blue-deep to-[#1e293b]",
                    "bg-gradient-to-br from-green to-teal",
                    "bg-gradient-to-br from-[#1d4ed8] to-teal",
                    "bg-gradient-to-br from-[#0f766e] to-blue",
                    "bg-gradient-to-br from-blue to-[#1e293b]",
                  ][i % 8]
                }`}
              >
                <div className="w-full">
                  <p className="text-xs font-bold tracking-wider text-white/85 uppercase">{item.sector}</p>
                  <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                    <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                      {item.title}
                    </h2>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-md bg-white px-3 py-1.5 text-xs font-bold text-[#0056c7]"
                      >
                        Open {item.urlLabel} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="font-semibold text-teal-deep">{item.result}</p>
                <p className="mt-2 text-sm text-muted-on-light">{item.summary}</p>
                {item.brief && (
                  <div className="mt-5">
                    <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">
                      Wat was de vraag?
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-on-light">{item.brief}</p>
                  </div>
                )}
                {item.capabilities.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">
                      Wat de site moet kunnen
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {item.capabilities.map((c) => (
                        <li key={c} className="flex gap-2 text-sm text-ink-on-light">
                          <span className="text-green">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.backendItems.length > 0 && (
                  <div className="mt-5 rounded-md border border-[#d7e3f2] bg-white/70 p-4">
                    <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">
                      Wat de backoffice inhoudt
                    </p>
                    {item.backend && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-on-light">{item.backend}</p>
                    )}
                    <ul className="mt-2 space-y-1.5">
                      {item.backendItems.map((c) => (
                        <li key={c} className="flex gap-2 text-sm text-ink-on-light">
                          <span className="text-teal-deep">→</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
