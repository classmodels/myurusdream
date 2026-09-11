import Link from "next/link";
import { webSolutions } from "@/lib/content";

function IconMobile() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
      <rect x="7" y="5" width="18" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="23" y="12" width="15" height="24" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 28h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 32h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconShop() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
      <path
        d="M15 17h18l-1.4 20H16.4L15 17Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19 17c0-3.8 2.2-6.5 5-6.5s5 2.7 5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M15 17h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconErp() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
      <rect x="6" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="28" y="7" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="17" y="31" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 17v5h22v-5M24 22v9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCrm() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
      <path
        d="M14 28c-3 1-5 3.5-5 7h12c0-3.5-2-6-5-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M34 28c3 1 5 3.5 5 7H27c0-3.5 2-6 5-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 26c2.5-1.5 5-1 8 1 3-2 5.5-2.5 8-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="30" cy="16" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-12 w-12" aria-hidden>
      <rect x="12" y="8" width="10" height="22" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="26" y="8" width="10" height="22" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14h6M14 20h6M28 14h6M28 20h6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M22 34c0 2.2 2.7 4 6 4s6-1.8 6-4-2.7-4-6-4-6 1.8-6 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M17 30v4c1.5 2 4 3.2 7 3.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const icons = [IconMobile, IconShop, IconErp, IconCrm, IconDatabase];

const LINE = "#e11d48";

export function WebSolutionsRail() {
  const n = webSolutions.length;

  return (
    <section id="webapps" className="scroll-mt-28 bg-[#f3f5f8] py-16 md:py-20">
      <div className="container-x relative overflow-hidden">
        {/* Decoratieve hexagon (links, zoals voorbeeld) */}
        <svg
          className="pointer-events-none absolute -left-6 top-8 hidden h-40 w-40 text-[#e11d48]/45 lg:block"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden
        >
          <path
            d="M35 20 L70 10 L95 35 L85 70 L50 80 L25 55 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M48 32 L72 24 L88 44 L80 66 L56 74 L40 54 Z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>

        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#3a4454] md:text-4xl">
            WebApp&apos;s - Webapplicaties - Software
          </h2>
          <p className="mt-3 text-[15px] text-[#7a8699]">
            Onze oplossingen op maat zijn inzetbaar in je ganse organisatie!
          </p>
        </div>

        {/* Boomstructuur: titel → lijn → kaarten → lijn */}
        <div className="relative mt-2 hidden lg:block">
          {/* Stam van subtitle naar horizontale rail */}
          <div
            className="mx-auto h-10 w-px"
            style={{ backgroundColor: LINE }}
            aria-hidden
          />

          {/* Bovenste horizontale rail + drops naar kaarten */}
          <div className="relative" aria-hidden>
            <div
              className="absolute top-0 h-px"
              style={{
                backgroundColor: LINE,
                left: `calc(${100 / (n * 2)}%)`,
                right: `calc(${100 / (n * 2)}%)`,
              }}
            />
            <div className="grid grid-cols-5">
              {webSolutions.map((item) => (
                <div key={`top-${item.title}`} className="flex justify-center">
                  <div className="h-8 w-px" style={{ backgroundColor: LINE }} />
                </div>
              ))}
            </div>
          </div>

          {/* Kaarten */}
          <div className="grid grid-cols-5 gap-4">
            {webSolutions.map((item, i) => {
              const Icon = icons[i];
              return (
                <article
                  key={item.title}
                  className="group relative flex min-h-[220px] flex-col border border-[#d8dee8] bg-white px-4 pb-10 pt-7 text-center shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                  style={{ borderRadius: "1.35rem 0.35rem 1.35rem 0.35rem" }}
                >
                  <div className="mx-auto text-[#8b95a5]">
                    <Icon />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold text-[#3a4454]">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#7a8699]">{item.text}</p>
                  <Link
                    href="/offerte"
                    className="absolute bottom-3 right-4 text-xl font-light leading-none text-[#e11d48] transition group-hover:scale-110"
                    aria-label={`Meer over ${item.title}`}
                  >
                    +
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Onderste drops + horizontale rail + stam omlaag */}
          <div className="relative" aria-hidden>
            <div className="grid grid-cols-5">
              {webSolutions.map((item) => (
                <div key={`bot-${item.title}`} className="flex justify-center">
                  <div className="h-8 w-px" style={{ backgroundColor: LINE }} />
                </div>
              ))}
            </div>
            <div
              className="absolute bottom-0 h-px"
              style={{
                backgroundColor: LINE,
                left: `calc(${100 / (n * 2)}%)`,
                right: `calc(${100 / (n * 2)}%)`,
              }}
            />
          </div>
          <div className="mx-auto h-10 w-px" style={{ backgroundColor: LINE }} aria-hidden />
        </div>

        {/* Mobiel / tablet: zonder lijnen, gestapeld */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
          {webSolutions.map((item, i) => {
            const Icon = icons[i];
            return (
              <article
                key={item.title}
                className="group relative flex min-h-[200px] flex-col border border-[#d8dee8] bg-white px-5 pb-10 pt-7 text-center"
                style={{ borderRadius: "1.35rem 0.35rem 1.35rem 0.35rem" }}
              >
                <div className="mx-auto text-[#8b95a5]">
                  <Icon />
                </div>
                <h3 className="mt-4 text-[15px] font-bold text-[#3a4454]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#7a8699]">{item.text}</p>
                <Link
                  href="/offerte"
                  className="absolute bottom-3 right-4 text-xl font-light leading-none text-[#e11d48]"
                  aria-label={`Meer over ${item.title}`}
                >
                  +
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
