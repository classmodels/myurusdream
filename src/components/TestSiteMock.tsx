"use client";

import { useMemo, useState } from "react";
import type { PreviewPublic } from "@/lib/preview-model";

export function TestSiteMock({ project, live = false }: { project: PreviewPublic; live?: boolean }) {
  const pages = project.pages || [];
  const [active, setActive] = useState(0);
  const services = useMemo(
    () =>
      String(project.services || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [project.services],
  );
  const page = pages[active];
  const accent = project.accent || "#2563eb";
  const accent2 = project.accent2 || "#0f766e";

  return (
    <div
      className={
        live
          ? "min-h-dvh bg-white text-[#0b1220]"
          : "overflow-hidden rounded-tr-2xl bg-white text-[#0b1220] shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/10"
      }
    >
      <header
        className="flex items-center justify-between gap-3 px-5 py-4 text-white"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent2})` }}
      >
        <div className="flex items-center gap-3">
          {project.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.logoUrl} alt="" className="h-10 w-10 rounded-md bg-white object-contain p-1" />
          ) : null}
          <div>
            <p className="text-sm font-extrabold">{project.title}</p>
            {project.tagline ? <p className="text-xs text-white/80">{project.tagline}</p> : null}
          </div>
        </div>
        {live ? (
          <nav className="hidden gap-4 text-sm font-semibold text-white/90 sm:flex">
            <a href="#aanbod" className="hover:text-white">
              Aanbod
            </a>
            <a href="#over" className="hover:text-white">
              Over
            </a>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </nav>
        ) : (
          <p className="hidden text-xs font-bold tracking-wide uppercase sm:block">Voorbeeld</p>
        )}
      </header>

      <section className="px-5 py-8 sm:px-8">
        <p className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: accent }}>
          {project.clientLabel || "Website in opbouw"}
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold sm:text-4xl">
          {project.tagline || project.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5a6b80] sm:text-base">
          {project.heroText || project.summary}
        </p>
      </section>

      {pages.length > 0 ? (
        <section className="border-t border-[#e6edf5] px-5 py-6 sm:px-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide uppercase" style={{ color: accent2 }}>
                Pagina’s van de site
              </p>
              <p className="mt-1 text-sm text-[#5a6b80]">
                Blader door de schermen. Zo ziet u of de richting bevalt.
              </p>
            </div>
            <p className="text-sm font-bold" style={{ color: accent }}>
              {active + 1} / {pages.length} · {page?.title}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl bg-[#0b1220] ring-1 ring-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={page?.imageUrl} alt={page?.title || "Pagina"} className="mx-auto max-h-[70vh] w-full object-contain bg-[#0b1220]" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {pages.map((item, i) => (
              <button
                key={item.imageUrl}
                type="button"
                onClick={() => setActive(i)}
                className={`shrink-0 overflow-hidden rounded-lg ${
                  i === active ? "" : "opacity-70 hover:opacity-100"
                }`}
                style={{ outline: i === active ? `3px solid ${accent}` : "3px solid transparent" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {project.about ? (
        <section id="over" className="border-t border-[#e6edf5] px-5 py-8 sm:px-8">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">Over ons</h3>
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-[#334155]">{project.about}</p>
        </section>
      ) : null}

      {services.length > 0 ? (
        <section id="aanbod" className="border-t border-[#e6edf5] px-5 py-8 sm:px-8">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">Aanbod</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {services.map((item) => (
              <li key={item} className="rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: accent }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {project.contact ? (
        <section
          id="contact"
          className="px-5 py-6 text-sm text-white sm:px-8"
          style={{ background: `linear-gradient(90deg, ${accent2}, ${accent})` }}
        >
          <p className="font-bold">Contact</p>
          <p className="mt-1 whitespace-pre-line text-white/90">{project.contact}</p>
        </section>
      ) : live ? null : (
        <div className="px-5 py-3 text-center text-[11px] text-[#7d8da3]">Voorbeeld via SiteButler — nog niet de live website</div>
      )}
    </div>
  );
}
