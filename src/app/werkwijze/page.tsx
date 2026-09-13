import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { processSteps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Werkwijze",
  description: "Gestructureerd proces van intake tot livegang in vijf stappen.",
};

const stepThemes = [
  {
    bg: "bg-[#007aff]",
    soft: "bg-[#e8f2ff]",
    border: "border-[#007aff]",
    text: "text-[#004bb5]",
    badge: "bg-[#007aff]",
  },
  {
    bg: "bg-[#0d9488]",
    soft: "bg-[#e6faf6]",
    border: "border-[#0d9488]",
    text: "text-[#0f766e]",
    badge: "bg-[#0d9488]",
  },
  {
    bg: "bg-[#16a34a]",
    soft: "bg-[#e8fbf1]",
    border: "border-[#16a34a]",
    text: "text-[#15803d]",
    badge: "bg-[#16a34a]",
  },
  {
    bg: "bg-[#ef4444]",
    soft: "bg-[#ffe8e9]",
    border: "border-[#ef4444]",
    text: "text-[#b91c1c]",
    badge: "bg-[#ef4444]",
  },
  {
    bg: "bg-[#7c3aed]",
    soft: "bg-[#f3e8ff]",
    border: "border-[#7c3aed]",
    text: "text-[#6d28d9]",
    badge: "bg-[#7c3aed]",
  },
] as const;

export default function WerkwijzePage() {
  return (
    <>
      <section className="mesh-hero">
        <div className="container-x py-10 md:py-20">
          <p className="eyebrow">Werkwijze</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Een helder proces. Voorspelbare oplevering.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            U weet steeds waar het project staat — van intake tot livegang en nazorg.
          </p>
        </div>
      </section>

      <CtaBand className="pb-10 md:pb-14" />

      <section className="section pt-0">
        <div className="container-x grid gap-5">
          {processSteps.map((step, i) => {
            const theme = stepThemes[i] ?? stepThemes[0];
            return (
              <article
                key={step.step}
                className={`overflow-hidden rounded-2xl border-2 ${theme.border} ${theme.soft} shadow-[0_14px_30px_rgba(0,0,0,0.22)]`}
              >
                <div className={`h-2 w-full ${theme.bg}`} />
                <div className="grid gap-5 p-6 md:grid-cols-[140px_1fr] md:items-center md:p-8">
                  <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-md ${theme.badge}`}
                    >
                      {step.step}
                    </span>
                    <p className={`text-sm font-bold tracking-[0.14em] uppercase ${theme.text}`}>
                      Stap {step.step}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-ink-on-light">{step.title}</h2>
                    <p className="mt-2 text-base leading-relaxed text-muted-on-light">{step.text}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="container-x mt-10 flex flex-wrap gap-3">
          <Link href="/offerte" className="btn-primary">Offerte aanvragen</Link>
          <Link href="/briefing" className="btn-ghost">Briefing uploaden</Link>
        </div>
      </section>
    </>
  );
}
