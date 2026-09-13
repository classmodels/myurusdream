"use client";

import { useEffect, useState } from "react";
import { formatCents } from "@/lib/money";
import { useDict, useLocale } from "@/lib/i18n/client";
import { localeNumberTag } from "@/lib/i18n/config";

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
  deductFees?: boolean;
};

export type LiveCounterUpdate = {
  title: string;
  body: string;
  createdAt: string;
};

function useLiveStats(initial: LiveCounterStats) {
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

  return stats;
}

function CounterHeadline({
  stats,
  showTitle,
  align = "left",
  compact = false,
}: {
  stats: LiveCounterStats;
  showTitle?: boolean;
  align?: "left" | "right";
  compact?: boolean;
}) {
  const dict = useDict();
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      {showTitle ? (
        <p className="font-display text-base tracking-[0.22em] text-yellow md:text-lg">
          {dict.home.liveCounter}
        </p>
      ) : null}
      <h2
        className={`${showTitle ? (compact ? "mt-3" : "mt-5") : ""} font-display leading-none ${
          compact ? "text-4xl md:text-[2.75rem]" : "text-4xl md:text-5xl"
        }`}
      >
        {formatCents(stats.raisedCents)}
        <span className={`text-white/35 ${compact ? "ml-2" : ""}`}> / {formatCents(stats.goalCents)}</span>
      </h2>
      <p className={`text-white/55 ${compact ? "mt-2.5 text-base" : "mt-2 text-sm"}`}>
        <span>
          €2{" "}
          <span className={`text-yellow ${compact ? "ml-2" : ""}`}>
            {formatCents(stats.contributionCents)}
          </span>
        </span>
        <span className={compact ? "mx-3.5 text-white/25" : "mx-2 text-white/25"}>·</span>
        <span>
          {dict.counter.sponsors}{" "}
          <span className={`text-yellow ${compact ? "ml-2" : ""}`}>
            {formatCents(stats.sponsorCents)}
          </span>
        </span>
        <span className={compact ? "mx-3.5 text-white/25" : "mx-2 text-white/25"}>·</span>
        <span>
          {dict.counter.pixels}{" "}
          <span className={`text-yellow ${compact ? "ml-2" : ""}`}>
            {formatCents(stats.pixelCents)}
          </span>
        </span>
      </p>
    </div>
  );
}

export function LiveCounterHeadline({
  initial,
  className,
}: {
  initial: LiveCounterStats;
  className?: string;
}) {
  const stats = useLiveStats(initial);
  return (
    <div className={className}>
      <CounterHeadline stats={stats} showTitle align="right" compact />
    </div>
  );
}

export function LiveCounter({
  initial,
  className,
  showTitle = true,
  latestUpdate,
  hideHeadlineOnDesktop = false,
  flushTop = false,
}: {
  initial: LiveCounterStats;
  className?: string;
  showTitle?: boolean;
  latestUpdate?: LiveCounterUpdate | null;
  hideHeadlineOnDesktop?: boolean;
  flushTop?: boolean;
}) {
  const dict = useDict();
  const locale = useLocale();
  const tag = localeNumberTag(locale);
  const stats = useLiveStats(initial);
  const pct = Math.min(100, stats.percent);

  return (
    <section
      id="teller"
      className={`relative z-0 overflow-x-clip bg-surface ${
        flushTop ? "pt-0 pb-16 md:pb-20" : "pt-8 pb-16 md:pt-10 md:pb-20"
      } ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5">
        {showTitle || !hideHeadlineOnDesktop ? (
          <div className={hideHeadlineOnDesktop ? "md:hidden" : undefined}>
            <CounterHeadline stats={stats} showTitle={showTitle} />
          </div>
        ) : null}
        <div className={`${flushTop ? "mt-4 md:mt-0 md:pt-3" : "mt-8"} flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted`}>
          <span>
            {dict.counter.ofGoal}{" "}
            <span className="text-yellow">
              {pct.toLocaleString(tag, { maximumFractionDigits: 2 })}%
            </span>
          </span>
          <span>
            {dict.counter.stillNeed}{" "}
            <span className="text-yellow">{formatCents(stats.remainingCents)}</span>
          </span>
        </div>
        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Stat label={dict.counter.total} value={formatCents(stats.contributionCents)} />
          <Stat
            label={dict.counter.participants}
            value={`${stats.participantCount.toLocaleString(tag)} / ${stats.targetContributions.toLocaleString(tag)}`}
          />
          <Stat
            label={dict.counter.sponsors}
            value={formatCents(stats.sponsorCents)}
            hint={`${stats.sponsorCount.toLocaleString(tag)} ${
              stats.sponsorCount === 1 ? dict.counter.deposit : dict.counter.deposits
            }`}
          />
          <Stat
            label={dict.counter.pixels}
            value={formatCents(stats.pixelCents)}
            hint={`${stats.pixelCount.toLocaleString(tag)} ${
              stats.pixelCount === 1 ? dict.counter.deposit : dict.counter.deposits
            }`}
          />
          <VisitorStat total={stats.uniqueVisitors} online={stats.onlineVisitors} />
          {latestUpdate ? <UpdateStat update={latestUpdate} /> : null}
        </div>

        <p className="mt-6 text-sm text-muted">
          {stats.deductFees ? dict.counter.noteNet : dict.counter.note}
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
    deductFees: s.deductFees ?? false,
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

function UpdateStat({ update }: { update: LiveCounterUpdate }) {
  const dict = useDict();
  const locale = useLocale();
  const date = new Date(update.createdAt).toLocaleDateString(localeNumberTag(locale));
  return (
    <div className="card-dark col-span-2 min-w-0 overflow-hidden px-3 py-3 sm:px-4">
      <p className="text-[clamp(0.52rem,2.6vw,0.65rem)] uppercase leading-tight tracking-[0.12em] text-muted sm:tracking-[0.2em]">
        {dict.counter.update}
      </p>
      <p className="mt-1.5 font-display text-[clamp(1.05rem,4.6vw,1.35rem)] leading-tight text-yellow md:text-xl">
        {update.title}
      </p>
      <p className="mt-1 text-[clamp(0.62rem,2.4vw,0.75rem)] text-white/40">{date}</p>
      <p className="mt-1 line-clamp-2 text-[clamp(0.7rem,2.6vw,0.85rem)] text-white/70">{update.body}</p>
    </div>
  );
}

function VisitorStat({ total, online }: { total: number; online: number }) {
  const dict = useDict();
  const locale = useLocale();
  const tag = localeNumberTag(locale);
  return (
    <div className="card-dark col-span-2 min-w-0 overflow-hidden px-3 py-3 sm:px-4">
      <p className="text-center text-[clamp(0.52rem,2.6vw,0.65rem)] uppercase leading-tight tracking-[0.12em] text-muted sm:tracking-[0.2em]">
        {dict.counter.visitors}
      </p>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:gap-4">
        <div className="min-w-0 text-left">
          <p className="text-[clamp(0.5rem,2.4vw,0.62rem)] uppercase leading-tight tracking-[0.1em] text-white/40">
            {dict.counter.totalLabel}
          </p>
          <p className="mt-0.5 font-display text-[clamp(1.15rem,5vw,1.75rem)] leading-none text-yellow">
            {total.toLocaleString(tag)}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <p className="inline-flex items-center justify-end gap-1 text-[clamp(0.5rem,2.4vw,0.62rem)] uppercase leading-tight tracking-[0.1em] text-white/40">
            <span className="online-dot shrink-0" aria-hidden="true" />
            {dict.counter.online}
          </p>
          <p className="mt-0.5 font-display text-[clamp(1.15rem,5vw,1.75rem)] leading-none text-yellow">
            {online.toLocaleString(tag)}
          </p>
        </div>
      </div>
    </div>
  );
}
