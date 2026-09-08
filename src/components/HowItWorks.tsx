import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const icons = ["wallet", "star", "share", "people", "chart", "gift"] as const;

export async function HowItWorks() {
  const dict = await getDictionary();
  const how = dict.how;

  return (
    <section id="how-it-works" className="relative z-0 -mt-[70px] bg-black">
      <span id="hoe" className="absolute top-0" aria-hidden />
      <div className="relative overflow-hidden pt-20 pb-1 md:pt-28 md:pb-1">
        <div className="absolute inset-0">
          <img
            src="/images/urus-night.png?v=20260908a"
            alt=""
            className="h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-5xl italic md:text-7xl">
            {how.titleHoe} <span className="text-yellow">{how.titleWerkt}</span>
          </p>
          <p className="mt-4 max-w-xl text-white/70">{how.intro}</p>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div className="space-y-3">
              {how.steps.map((title, i) => (
                <div
                  key={icons[i]}
                  className="step-para flex items-center gap-4 border border-yellow/70 bg-black/70 px-6 py-4"
                >
                  <span className="font-display text-2xl text-yellow">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <StepIcon name={icons[i]} />
                  <p className="font-medium">{title}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <div className="border border-yellow/60 bg-black/70 p-6">
                <p className="font-display text-2xl text-yellow">{how.chancesTitle}</p>
                <ul className="mt-3 space-y-2 text-white/80">
                  {how.chances.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="border border-yellow/60 bg-black/70 p-6">
                <p className="font-display text-2xl text-yellow">{how.transparencyTitle}</p>
                <p className="mt-3 text-white/80">{how.transparencyBody}</p>
                <Link
                  href="/volg-alles"
                  className="mt-4 inline-block text-sm uppercase tracking-widest text-yellow"
                >
                  {how.transparencyLink}
                </Link>
              </div>
              <p className="text-center text-sm text-white/60">
                <span className="text-yellow">♥</span> {how.heart}
              </p>
              <Link href="/meedoen" className="btn-yellow">
                {dict.common.meedoen}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepIcon({ name }: { name: string }) {
  const common = "h-7 w-7 shrink-0 text-white";
  if (name === "wallet") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <circle cx="16" cy="13.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l2.2 6.4H21l-5.3 3.9 2 6.2L12 16.8 6.3 19.5l2-6.2L3 9.4h6.8L12 3z" />
      </svg>
    );
  }
  if (name === "share") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="6" cy="12" r="2.2" />
        <circle cx="17" cy="6" r="2.2" />
        <circle cx="17" cy="18" r="2.2" />
        <path d="M8 11.2 15 7.2M8 12.8l7 4" />
      </svg>
    );
  }
  if (name === "people") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="8" r="3" />
        <circle cx="16" cy="9" r="2.2" />
        <path d="M4 18c.8-3 3-4.5 5-4.5s4.2 1.5 5 4.5M14 18c.4-2 1.8-3.2 3.5-3.2 1.4 0 2.6.8 3.2 3.2" />
      </svg>
    );
  }
  if (name === "gift") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="11" width="16" height="9" />
        <path d="M4 11h16M12 11v9M12 11c0-3 4-5 4-2s-4 1-4 2c0-1-4-5-4-2s4 2 4 2" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19V5M4 19h16" />
      <path d="M7 15l4-4 3 3 5-7" />
    </svg>
  );
}
