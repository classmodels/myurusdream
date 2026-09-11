import Link from "next/link";
import type { ReactNode } from "react";
import { CtaBand } from "@/components/CtaBand";
import { serviceNavLinks, services, type ServiceSlug } from "@/lib/content";

const headerStyles: Record<string, string> = {
  blue: "bg-gradient-to-r from-[#007aff] to-[#60a5fa]",
  teal: "bg-gradient-to-r from-[#0d9488] to-[#2dd4bf]",
  green: "bg-gradient-to-r from-[#16a34a] to-[#4ade80]",
  coral: "bg-gradient-to-r from-[#ef4444] to-[#f87171]",
};

const bodyStyles: Record<string, string> = {
  blue: "bg-gradient-to-b from-[#dbeafe] via-[#eff6ff] to-white",
  teal: "bg-gradient-to-b from-[#ccfbf1] via-[#f0fdfa] to-white",
  green: "bg-gradient-to-b from-[#dcfce7] via-[#f0fdf4] to-white",
  coral: "bg-gradient-to-b from-[#fee2e2] via-[#fef2f2] to-white",
};

type Service = (typeof services)[number];

export function ServicePageShell({
  service,
  children,
  below,
}: {
  service: Service;
  children?: ReactNode;
  below?: ReactNode;
}) {
  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <>
      <CtaBand
        withMesh
        className=""
        title={service.ctaTitle}
        text={service.summary}
        sideEyebrow="Diensten"
        sideTitle={service.title}
        sideAsH1
      />

      <section className="section -mt-6 pt-0 md:-mt-10">
        <div className="container-x">
          <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <article
              className={`overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodyStyles[service.color]}`}
            >
              <div className={`px-7 py-3.5 ${headerStyles[service.color]}`}>
                <p className="text-xs font-bold tracking-wide text-white uppercase">Wat u krijgt</p>
              </div>
              <div className="p-7 md:p-9">
                <p className="text-base leading-relaxed text-ink-on-light">{service.intro}</p>
                <ul className="mt-6 space-y-2.5">
                  {service.includes.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-ink-on-light">
                      <span className="text-green">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 space-y-2 border-t border-[#d7e3f2] pt-6">
                  {service.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm font-medium text-ink-on-light">
                      <span className="text-teal-deep">→</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <aside
              className={`flex flex-col overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] ${bodyStyles[service.color]}`}
            >
              <div className={`px-6 py-3.5 ${headerStyles[service.color]}`}>
                <p className="text-xs font-bold tracking-wide text-white uppercase">Volgende stap</p>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-sm text-ink-on-light">
                  Vraag een offerte of lever bestaande bestanden aan via het briefingportaal.
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <Link href={`/offerte?dienst=${service.slug}`} className="btn-primary text-sm">
                    Offerte aanvragen
                  </Link>
                  <Link href="/briefing" className="btn-secondary text-sm">
                    Briefing uploaden
                  </Link>
                  <Link href="/prijzen" className="text-sm font-semibold text-blue-deep hover:underline">
                    Bekijk prijzen →
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {children}
        </div>
      </section>

      {below}

      <section className="-mt-8 bg-bg-alt pt-6 pb-16 md:-mt-12 md:pt-8 md:pb-20">
        <div className="container-x">
          <p className="eyebrow">Andere diensten</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink md:text-3xl">
            Ook interessant voor uw traject
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/diensten/${s.slug}`}
                className={`group overflow-hidden rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 ${bodyStyles[s.color]}`}
              >
                <div className={`px-5 py-3 ${headerStyles[s.color]}`}>
                  <p className="text-sm font-bold text-white">{s.menuLabel}</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-muted-on-light">{s.summary}</p>
                  <p className="mt-3 text-sm font-bold text-ink-on-light group-hover:text-blue-deep">
                    Meer info →
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/diensten" className="btn-secondary text-sm">
              Alle diensten
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServiceOverviewCards({ exclude }: { exclude?: ServiceSlug }) {
  const list = exclude ? services.filter((s) => s.slug !== exclude) : services;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.map((s) => (
        <Link
          key={s.slug}
          href={`/diensten/${s.slug}`}
          className={`group flex flex-col overflow-hidden rounded-xl shadow-[0_16px_36px_rgba(0,0,0,0.26)] transition hover:-translate-y-0.5 ${bodyStyles[s.color]}`}
        >
          <div className={`px-6 py-3.5 ${headerStyles[s.color]}`}>
            <p className="text-xs font-bold tracking-wide text-white uppercase">{s.menuLabel}</p>
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-on-light">
              {s.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-muted-on-light">{s.summary}</p>
            <p className="mt-4 text-sm font-bold text-ink-on-light group-hover:text-blue-deep">
              Bekijken →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export { serviceNavLinks };
