"use client";

import { AssetImage as Image } from "@/components/AssetImage";
import { useEffect, useMemo, useState } from "react";
import { museumPhotos } from "@/lib/content";

export type CatalogEntry = {
  id: string;
  name: string;
  image: string;
  year: string;
  origin: string;
  specs: readonly { label: string; value: string }[];
};

export function CatalogExplorer({ entries }: { entries: readonly CatalogEntry[] }) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.year.includes(q) ||
        e.origin.toLowerCase().includes(q) ||
        e.specs.some((s) => s.value.toLowerCase().includes(q)),
    );
  }, [entries, query]);

  const active = activeId ? (entries.find((e) => e.id === activeId) ?? null) : null;
  const activeIndex = active ? entries.findIndex((e) => e.id === active.id) : -1;
  const hovered = hoverId ? (entries.find((e) => e.id === hoverId) ?? null) : null;

  useEffect(() => {
    if (!activeId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveId(null);
      if (e.key === "ArrowRight" && activeIndex >= 0) {
        setActiveId(entries[(activeIndex + 1) % entries.length].id);
      }
      if (e.key === "ArrowLeft" && activeIndex >= 0) {
        setActiveId(entries[(activeIndex - 1 + entries.length) % entries.length].id);
      }
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activeId, activeIndex, entries]);

  const hero = museumPhotos[2];

  return (
    <>
      <section className="relative min-h-[28vh] overflow-hidden border-b border-steel md:min-h-[32vh]">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hangar via-hangar/80 to-hangar/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-hangar via-transparent to-hangar/40" />

        <div className="relative z-10 mx-auto flex min-h-[28vh] max-w-7xl flex-col justify-end px-4 pb-8 pt-16 md:min-h-[32vh] md:px-6 md:pb-10 md:pt-20">
          <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-brass uppercase">
            Digitale museumvitrine
          </p>
          <h1 className="font-display mt-2 max-w-4xl text-4xl tracking-wide text-ink md:text-6xl">
            Catalogus
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink-dim md:mt-8 md:text-lg">
            Zoek en blader door de gerestaureerde machines — merk, bouwjaar of land.
          </p>

          <div className="mt-5 max-w-sm">
            <label htmlFor="catalog-search" className="sr-only">
              Zoeken in collectie
            </label>
            <input
              id="catalog-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoeken in collectie…"
              className="w-full border border-white/20 bg-hangar/70 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-brass"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-9 md:grid-cols-4 md:gap-x-8 md:gap-y-10 lg:grid-cols-5 lg:gap-x-9 lg:gap-y-11">
          {filtered.map((entry, i) => {
            const nr = String(entries.findIndex((e) => e.id === entry.id) + 1).padStart(3, "0");
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActiveId(entry.id)}
                onMouseEnter={() => setHoverId(entry.id)}
                onMouseLeave={() => setHoverId((id) => (id === entry.id ? null : id))}
                className="group relative z-0 text-left outline-none hover:z-20"
              >
                <article className="overflow-hidden rounded-sm border border-steel/90 bg-[#12100d] transition duration-300 group-hover:-translate-y-1 group-hover:border-brass/55 group-hover:shadow-[0_18px_44px_rgba(0,0,0,0.5)]">
                  <div className="relative aspect-[5/4] bg-white px-4 py-4 md:px-5 md:py-5">
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      fill
                      className="object-contain p-1.5 transition duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      priority={i < 5}
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-[2px] bg-hangar/85 px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wider text-brass">
                      Nr. {nr}
                    </span>
                  </div>

                  <div className="border-t border-brass/25 bg-gradient-to-b from-[#1a1611] to-[#100e0b] px-2 py-1.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <h2 className="font-display truncate text-[0.95rem] leading-none tracking-wide text-ink">
                        {entry.name}
                      </h2>
                      <span className="shrink-0 font-mono text-[0.55rem] text-brass">{entry.year}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[0.58rem] text-ink-mute">{entry.origin}</p>
                    <dl className="mt-1 max-h-[4.6rem] space-y-0 overflow-hidden border-t border-steel/50 pt-1">
                      {entry.specs
                        .filter((s) => s.label !== "Bouwjaar" && s.label !== "Productie" && s.label !== "Oorsprong")
                        .slice(0, 5)
                        .map((spec) => (
                          <div key={spec.label} className="grid grid-cols-[0.38fr_0.62fr] gap-1">
                            <dt className="truncate text-[0.48rem] tracking-wide text-ink-mute uppercase">
                              {spec.label}
                            </dt>
                            <dd className="truncate text-[0.58rem] text-ink-dim">{spec.value}</dd>
                          </div>
                        ))}
                    </dl>
                  </div>
                </article>

                {/* Hover-popup: vergrote preview */}
                {hovered?.id === entry.id && !active && (
                  <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden w-[min(22rem,80vw)] -translate-x-1/2 -translate-y-[8%] md:block">
                    <div className="overflow-hidden rounded-sm border border-brass/50 bg-[#14110d] shadow-[0_28px_70px_rgba(0,0,0,0.7)]">
                      <div className="relative aspect-[5/4] bg-white">
                        <Image
                          src={entry.image}
                          alt=""
                          fill
                          className="object-contain p-3"
                          sizes="360px"
                        />
                      </div>
                      <div className="border-t border-brass/30 px-3 py-2.5">
                        <p className="font-display text-2xl tracking-wide text-ink">{entry.name}</p>
                        <p className="text-[0.7rem] text-ink-mute">
                          {entry.year} · {entry.origin}
                        </p>
                        <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-zetor uppercase">
                          Klik voor volledig plakkaat
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-mute">Geen resultaten voor “{query}”.</p>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-hangar/80 p-3 backdrop-blur-sm md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative grid max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-sm border border-brass/40 bg-[#14110d] shadow-[0_30px_80px_rgba(0,0,0,0.65)] md:grid-cols-[1.15fr_0.85fr]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="absolute right-3 top-3 z-10 rounded-sm border border-steel bg-hangar/90 px-2.5 py-1 text-xs font-semibold text-ink"
            >
              Sluiten
            </button>

            <div className="relative min-h-[40vh] bg-white md:min-h-[70vh]">
              <Image
                src={active.image}
                alt={active.name}
                fill
                className="object-contain p-4 md:p-8"
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
              />
            </div>

            <div className="overflow-y-auto border-t border-brass/30 p-5 md:border-t-0 md:border-l md:p-7">
              <p className="font-mono text-[0.65rem] tracking-wider text-brass">
                Nr. {String(activeIndex + 1).padStart(3, "0")} · Museumplakkaat
              </p>
              <h2 className="font-display mt-1 text-4xl tracking-wide text-ink md:text-5xl">
                {active.name}
              </h2>
              <p className="mt-1 text-sm text-ink-dim">
                {active.year} · {active.origin}
              </p>

              <dl className="mt-5 space-y-0 border-t border-steel">
                {active.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid grid-cols-[0.4fr_0.6fr] gap-2 border-b border-steel/70 py-2"
                  >
                    <dt className="text-[0.65rem] font-semibold tracking-[0.1em] text-ink-mute uppercase">
                      {spec.label}
                    </dt>
                    <dd className="text-sm text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="rounded-sm border border-steel px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink"
                  onClick={() =>
                    setActiveId(entries[(activeIndex - 1 + entries.length) % entries.length].id)
                  }
                >
                  ← Vorige
                </button>
                <button
                  type="button"
                  className="rounded-sm border border-steel px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink"
                  onClick={() => setActiveId(entries[(activeIndex + 1) % entries.length].id)}
                >
                  Volgende →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
