import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Over ons",
  description: "SiteButler: professionele websiteontwikkeling met optionele contentproductie.",
};

export default function OverOnsPage() {
  return (
    <>
      <section className="mesh-hero">
        <div className="container-x py-10 md:py-20">
          <p className="eyebrow">Over SiteButler</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Wij bouwen websites die zakelijk presteren.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            SiteButler ondersteunt organisaties bij het ontwikkelen van een sterke online
            aanwezigheid — met focus op duidelijkheid, geloofwaardigheid en resultaat.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x grid gap-5 md:grid-cols-3">
          {[
            ["Zakelijke uitstraling", "Strakke structuur, professionele tone of voice en een design dat vertrouwen wekt."],
            ["Commerciële focus", "Elke site is ontworpen om contactaanvragen, afspraken of bestellingen te stimuleren."],
            ["Eén aanspreekpunt", "Website én contentproductie — zonder versnippering over meerdere leveranciers."],
          ].map(([t, d]) => (
            <article key={t} className="card p-6">
              <div className="accent-bar mb-4" />
              <h2 className="text-xl font-bold text-ink-on-light">{t}</h2>
              <p className="mt-2 text-sm text-muted-on-light">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section bg-bg-alt pt-0">
        <div className="container-x">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">Veelgestelde vragen</h2>
          <div className="mt-6 grid gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="cursor-pointer list-none font-bold text-ink-on-light">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span className="text-blue-deep transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-on-light">{f.a}</p>
              </details>
            ))}
          </div>
          <Link href="/contact" className="btn-ghost mt-8 inline-flex text-sm">Contact opnemen</Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
