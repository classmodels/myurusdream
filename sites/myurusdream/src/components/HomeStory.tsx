"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useDict } from "@/lib/i18n/client";

function GoldTitle({ children, as: Tag = "h3" }: { children: ReactNode; as?: "h2" | "h3" }) {
  return (
    <Tag className="font-display text-[1.05rem] leading-snug tracking-[0.06em] text-yellow sm:text-xl md:text-2xl">
      {children}
    </Tag>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[0.95rem] leading-relaxed text-white/80 md:text-base">{children}</p>;
}

function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-yellow">{children}</strong>;
}

function GoldLine({ children }: { children: ReactNode }) {
  return (
    <Em>
      <span className="mt-1.5 block">{children}</span>
    </Em>
  );
}

function Quote({ children, block = false }: { children: ReactNode; block?: boolean }) {
  return (
    <em className={block ? "mt-1.5 block text-white/70" : "ml-3 text-white/70"}>
      {children}
    </em>
  );
}

function MoreBtn({
  expanded,
  onToggle,
  more,
  less,
}: {
  expanded: boolean;
  onToggle: () => void;
  more: string;
  less: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="ml-4 inline align-baseline font-display text-[0.75rem] uppercase tracking-[0.14em] text-white/40 transition hover:text-white/70"
      aria-expanded={expanded}
    >
      {expanded ? less : more}
    </button>
  );
}

export function HomeStory() {
  const dict = useDict();
  const s = dict.story;
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="verhaal" className="relative overflow-hidden bg-black pt-16 pb-10 md:pt-24 md:pb-14">
      <img
        src="/images/urus-dusk.png?v=20260908a"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
      />
      <div className="relative mx-auto max-w-7xl px-5">
        <p className="mb-3 font-display text-[0.75rem] tracking-[0.28em] text-yellow">{s.kicker}</p>
        <div className="story-heading-fit">
          <h2 className="font-display leading-[1.12] tracking-tight">
            <span className="story-heading-main text-yellow">{s.title}</span>
            <span className="story-heading-aside text-white/40">
              <span className="story-heading-aside-inner">
                {s.aside.a}
                <span className="story-heading-gap-lg">{s.aside.b}</span>
                <span className="story-heading-gap-sm">{s.aside.c}</span>
                <span className="story-heading-gap-lg">{s.aside.d}</span>
              </span>
            </span>
          </h2>
        </div>

        <article className="story-layout mt-4 md:mt-5">
          <div className="story-prose">
            <img
              src="/images/urus-detail.png?v=20260908c"
              alt={s.photoAlt}
              className="story-photo"
            />
            <P>
              {s.p1before}{" "}
              <Em>
                <span className="mt-2 block">{s.p1gold}</span>
              </Em>
            </P>
            <P>{s.p2}</P>
            <P>
              {s.p3before}{" "}
              <Em>
                <span className="mt-2 block">{s.p3gold}</span>
              </Em>
            </P>
            <P>
              {s.p4}
              {!expanded ? (
                <MoreBtn
                  expanded={false}
                  onToggle={() => setExpanded(true)}
                  more={s.more}
                  less={s.less}
                />
              ) : null}
            </P>
          </div>

          {expanded ? (
            <div className="story-prose story-rest mt-6 space-y-4">
              {s.rest.map((block, i) => {
                if (block.type === "title") {
                  return (
                    <GoldTitle key={i} as={i > 40 ? "h2" : "h3"}>
                      {block.text}
                    </GoldTitle>
                  );
                }
                if (block.type === "gold") {
                  return (
                    <P key={i}>
                      <GoldLine>{block.text}</GoldLine>
                    </P>
                  );
                }
                if (block.type === "quote") {
                  return (
                    <P key={i}>
                      <Quote block>{block.text}</Quote>
                    </P>
                  );
                }
                return <P key={i}>{block.text}</P>;
              })}
              <P>
                <MoreBtn
                  expanded
                  onToggle={() => setExpanded(false)}
                  more={s.more}
                  less={s.less}
                />
              </P>
            </div>
          ) : null}

          <div className="clear-both pt-8">
            <Link href="/meedoen" className="btn-yellow">
              {dict.common.meedoen}
            </Link>
            <p className="mt-4 max-w-2xl text-sm text-white/70 md:text-base">
              <Em>{s.ctaLine}</Em>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
