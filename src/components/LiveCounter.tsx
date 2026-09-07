"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/money";

export type LiveCounterStats = {
  raisedCents: number;
  goalCents: number;
  participantCount: number;
  targetContributions: number;
  remainingCents: number;
  remainingPeople: number;
  percent: number;
  contributionCents: number;
  sponsorCents: number;
  sponsorCount: number;
  pixelCents: number;
  pixelCount: number;
  uniqueVisitors: number;
  onlineVisitors: number;
};

export function LiveCounter({
  initial,
  className,
  showTitle = true,
}: {
  initial: LiveCounterStats;
  className?: string;
  showTitle?: boolean;
}) {
  const [stats, setStats] = useState(statsSafe(initial));

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (res.ok) setStats(statsSafe(await res.json()));
      } catch {
        /* keep last */
      }
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const pct = Math.min(100, stats.percent);

  return (
    <section
      id="teller"
      className={`relative z-0 overflow-x-clip bg-surface pt-8 pb-16 md:pt-10 md:pb-20 ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5">
        <div>
          {showTitle ? (
            <p className="font-display text-base tracking-[0.22em] text-yellow md:text-lg">
              Totaal live campagneteller
            </p>
          ) : null}
          <h2 className={`${showTitle ? "mt-5" : ""} font-display text-4xl leading-none md:text-5xl`}>
            {formatCents(stats.raisedCents)}
            <span className="text-white/35"> / {formatCents(stats.goalCents)}</span>
          </h2>
          <p className="mt-2 text-sm text-white/55">
            <span>
              €2 <span className="text-yellow">{formatCents(stats.contributionCents)}</span>
            </span>
            <span className="mx-2 text-white/25">·</span>
            <span>
              Sponsors <span className="text-yellow">{formatCents(stats.sponsorCents)}</span>
            </span>
            <span className="mx-2 text-white/25">·</span>
            <span>
              Pixels <span className="text-yellow">{formatCents(stats.pixelCents)}</span>
            </span>
          </p>
        </div>
        <div className="progress-track mt-8">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted">
          <span>
            Van het doel{" "}
            <span className="text-yellow">
              {pct.toLocaleString("nl-BE", { maximumFractionDigits: 2 })}%
            </span>
          </span>
          <span>
            Nog nodig <span className="text-yellow">{formatCents(stats.remainingCents)}</span>
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Stat label="Totaal van €2" value={formatCents(stats.contributionCents)} />
          <Stat
            label="Deelnemers / doel"
            value={`${stats.participantCount.toLocaleString("nl-BE")} / ${stats.targetContributions.toLocaleString("nl-BE")}`}
          />
          <Stat
            label="Sponsors"
            value={formatCents(stats.sponsorCents)}
            hint={`${stats.sponsorCount.toLocaleString("nl-BE")} storting${stats.sponsorCount === 1 ? "" : "en"}`}
          />
          <Stat
            label="Pixels"
            value={formatCents(stats.pixelCents)}
            hint={`${stats.pixelCount.toLocaleString("nl-BE")} storting${stats.pixelCount === 1 ? "" : "en"}`}
          />
          <VisitorStat total={stats.uniqueVisitors} online={stats.onlineVisitors} />
        </div>

        <p className="mt-6 text-sm text-muted">
          Alleen bevestigde betalingen tellen. Het getoonde totaal is bruto minus transactiekosten.
        </p>
      </div>
    </section>
  );
}

function statsSafe(s: Partial<LiveCounterStats>): LiveCounterStats {
  return {
    raisedCents: s.raisedCents ?? 0,
    goalCents: s.goalCents ?? 40_000_000,
    participantCount: s.participantCount ?? 0,
    targetContributions: s.targetContributions ?? 200_000,
    remainingCents: s.remainingCents ?? 40_000_000,
    remainingPeople: s.remainingPeople ?? 200_000,
    percent: s.percent ?? 0,
    contributionCents: s.contributionCents ?? 0,
    sponsorCents: s.sponsorCents ?? 0,
    sponsorCount: s.sponsorCount ?? 0,
    pixelCents: s.pixelCents ?? 0,
    pixelCount: s.pixelCount ?? 0,
    uniqueVisitors: s.uniqueVisitors ?? 0,
    onlineVisitors: s.onlineVisitors ?? 0,
  };
}

function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`card-dark min-w-0 overflow-hidden px-3 py-3 sm:px-4 ${className ?? ""}`}>
      <p className="text-[clamp(0.52rem,2.6vw,0.65rem)] uppercase leading-tight tracking-[0.12em] text-muted sm:tracking-[0.2em]">
        {label}
      </p>
      <p className="mt-1.5 font-display text-[clamp(1.05rem,4.6vw,1.5rem)] leading-none text-yellow md:text-2xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-[clamp(0.62rem,2.4vw,0.75rem)] text-white/40">{hint}</p> : null}
    </div>
  );
}

function VisitorStat({ total, online }: { total: number; online: number }) {
  return (
    <div className="card-dark col-span-2 min-w-0 overflow-hidden px-3 py-3 sm:px-4 lg:col-span-2">
      <p className="text-center text-[clamp(0.52rem,2.6vw,0.65rem)] uppercase leading-tight tracking-[0.12em] text-muted sm:tracking-[0.2em]">
        Bezoekers
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:gap-4">
        <div className="min-w-0 text-left">
          <p className="text-[clamp(0.5rem,2.4vw,0.62rem)] uppercase leading-tight tracking-[0.1em] text-white/40">
            Totaal
          </p>
          <p className="mt-0.5 font-display text-[clamp(1.15rem,5vw,1.75rem)] leading-none text-yellow">
            {total.toLocaleString("nl-BE")}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="inline-flex items-center justify-end gap-1 text-[clamp(0.5rem,2.4vw,0.62rem)] uppercase leading-tight tracking-[0.1em] text-white/40">
            <span className="online-dot shrink-0" aria-hidden="true" />
            Nu live
          </p>
          <p className="mt-0.5 font-display text-[clamp(1.15rem,5vw,1.75rem)] leading-none text-yellow">
            {online.toLocaleString("nl-BE")}
          </p>
        </div>
      </div>
    </div>
  );
}
