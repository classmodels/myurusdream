"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/money";

type Stats = {
  raisedCents: number;
  goalCents: number;
  participantCount: number;
  targetContributions: number;
  remainingCents: number;
  remainingPeople: number;
  percent: number;
};

export function LiveCounter({ initial }: { initial: Stats }) {
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
    <section id="teller" className="relative overflow-hidden bg-surface py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5">
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Live campagneteller</p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <h2 className="font-display text-5xl leading-none md:text-7xl">
            {formatCents(stats.raisedCents)}
            <span className="text-white/35"> / {formatCents(stats.goalCents)}</span>
          </h2>
        </div>
        <div className="progress-track mt-8">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Deelnemers" value={stats.participantCount.toLocaleString("nl-BE")} />
          <Stat
            label="Van het doel"
            value={`${pct.toLocaleString("nl-BE", { maximumFractionDigits: 2 })}%`}
          />
          <Stat label="Nog nodig" value={formatCents(stats.remainingCents)} />
          <Stat
            label="Deelnemers / doel"
            value={`${stats.participantCount.toLocaleString("nl-BE")} / ${stats.targetContributions.toLocaleString("nl-BE")}`}
          />
        </div>
        <p className="mt-6 text-sm text-muted">
          Alleen bevestigde betalingen tellen. Geen fictieve cijfers. Zonder betalingen: €0 / €400.000.
        </p>
      </div>
    </section>
  );
}

function statsSafe(s: Stats): Stats {
  return {
    raisedCents: s.raisedCents ?? 0,
    goalCents: s.goalCents ?? 40_000_000,
    participantCount: s.participantCount ?? 0,
    targetContributions: s.targetContributions ?? 200_000,
    remainingCents: s.remainingCents ?? 40_000_000,
    remainingPeople: s.remainingPeople ?? 200_000,
    percent: s.percent ?? 0,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-yellow">{value}</p>
    </div>
  );
}
