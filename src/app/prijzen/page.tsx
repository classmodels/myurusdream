import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { carePackages, contentPackages, packages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Prijzen",
  description:
    "Websitepakketten vanaf €1.250, plus Pilot Care hosting & beheer en optionele contentmodules.",
};

export default function PrijzenPage() {
  return (
    <>
      <CtaBand
        withMesh
        className=""
        sideEyebrow="Prijzen"
        sideTitle="Transparante investering. Duidelijke scope."
        sideAsH1
      />

      <section className="section -mt-6 pt-0 md:-mt-10">
        <div className="container-x">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">Eenmalig — website bouwen</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              Kies uw websitepakket
            </h2>
            <p className="mt-2 text-ink-soft">
              Duidelijke scope, vaste prijs. Hosting &amp; beheer regelen we apart via Pilot Care.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {packages.map((pkg, i) => {
              const headers = [
                "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
                "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
                "bg-gradient-to-r from-[#ef4444] to-[#f87171]",
              ] as const;
              const bodies = [
                "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
                "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
                "bg-gradient-to-b from-[#fee2e2] via-[#fef2f2] to-white",
              ] as const;
              return (
                <div key={pkg.id} className="relative">
                  <article
                    className={`relative flex h-full flex-col overflow-visible rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodies[i]}`}
                  >
                    <div className={`relative rounded-t-xl px-7 py-3.5 ${headers[i]}`}>
                      <p className="pr-28 text-xs font-bold tracking-wide text-white uppercase">
                        {pkg.tag}
                      </p>
                      {pkg.highlight && (
                        <span className="absolute right-4 bottom-0 z-20 translate-y-1/2 rounded-md bg-blue px-3 py-1 text-xs font-bold whitespace-nowrap text-white shadow-sm">
                          Meest gekozen
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col rounded-b-xl p-7">
                      <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink-on-light">
                        {pkg.name}
                      </h3>
                      <p className="mt-4 text-4xl font-extrabold text-blue-deep">
                        {pkg.price}
                        {pkg.price.startsWith("€") && (
                          <span className="ml-1 text-sm font-semibold text-muted-on-light">excl. btw</span>
                        )}
                      </p>
                      <p className="mt-4 text-sm text-muted-on-light">{pkg.description}</p>
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex gap-2 text-sm text-ink-on-light">
                            <span className="text-green">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/offerte?pakket=${pkg.id}`}
                        className={pkg.highlight ? "btn-primary mt-8 text-sm" : "btn-secondary mt-8 text-sm"}
                      >
                        Kies {pkg.name}
                      </Link>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section -mt-4 pt-0 md:-mt-6">
        <div className="container-x">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">Doorlopend — hosting &amp; beheer</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
              Pilot Care
            </h2>
            <p className="mt-2 text-ink-soft">
              Site online, domein &amp; mail geregeld, én een aanspreekpunt voor aanpassingen.
              U betaalt één duidelijk jaurbedrag — wij zorgen voor de techniek.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {carePackages.map((pkg, i) => {
              const headers = [
                "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
                "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
              ] as const;
              const bodies = [
                "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
                "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
              ] as const;
              return (
                <div key={pkg.id} className="relative">
                  <article
                    className={`relative flex h-full flex-col overflow-visible rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodies[i]}`}
                  >
                    <div className={`relative rounded-t-xl px-7 py-3.5 ${headers[i]}`}>
                      <p className="pr-28 text-xs font-bold tracking-wide text-white uppercase">
                        {pkg.tag}
                      </p>
                      {pkg.highlight && (
                        <span className="absolute right-4 bottom-0 z-20 translate-y-1/2 rounded-md bg-blue px-3 py-1 text-xs font-bold whitespace-nowrap text-white shadow-sm">
                          Aanbevolen
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col rounded-b-xl p-7">
                      <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink-on-light">
                        {pkg.name}
                      </h3>
                      <p className="mt-4 text-4xl font-extrabold text-blue-deep">
                        {pkg.price}
                        <span className="ml-1 text-sm font-semibold text-muted-on-light">
                          {pkg.period} excl. btw
                        </span>
                      </p>
                      <p className="mt-4 text-sm text-muted-on-light">{pkg.description}</p>
                      <ul className="mt-6 flex-1 space-y-2.5">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex gap-2 text-sm text-ink-on-light">
                            <span className="text-green">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/offerte?pakket=${pkg.id}`}
                        className={pkg.highlight ? "btn-primary mt-8 text-sm" : "btn-secondary mt-8 text-sm"}
                      >
                        Kies {pkg.name}
                      </Link>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-ink-soft">
            Domeinnaam (.be) en mailboxen rekenen we door tegen kostprijs of nemen we op in Care.
            Grotere wijzigingen buiten het maandbudget: vaste uurprijs na akkoord.
          </p>
        </div>
      </section>

      <section className="section -mt-6 bg-bg-alt pt-0 md:-mt-10">
        <div className="container-x">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
            Optionele contentmodules
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {contentPackages.map((c, i) => {
              const headers = [
                "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
                "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
                "bg-gradient-to-r from-[#16a34a] to-[#4ade80]",
                "bg-gradient-to-r from-[#ef4444] to-[#f87171]",
              ] as const;
              const bodies = [
                "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
                "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
                "bg-gradient-to-b from-[#dcfce7] via-[#f0fdf4] to-white",
                "bg-gradient-to-b from-[#fee2e2] via-[#fef2f2] to-white",
              ] as const;
              return (
                <article
                  key={c.title}
                  className={`overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodies[i]}`}
                >
                  <div className={`px-5 py-3.5 ${headers[i]}`}>
                    <h3 className="font-bold text-white">{c.title}</h3>
                  </div>
                  <div className="p-5">
                    <p className="font-extrabold text-blue-deep">{c.price}</p>
                    <p className="mt-2 text-sm text-muted-on-light">{c.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
