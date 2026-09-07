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
          <span>
            Bezoekers <span className="text-yellow">{stats.uniqueVisitors.toLocaleString("nl-BE")}</span>
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
          <Stat
            label="Bezoekers"
            value={stats.uniqueVisitors.toLocaleString("nl-BE")}
            hint="Unieke mensen op de site"
          />
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
    <div className={`card-dark px-4 py-3 ${className ?? ""}`}>
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-1.5 font-display text-xl text-yellow md:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
    </div>
  );
}
