"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  groupSponsors,
  isExampleSponsor,
  sponsorSignupHref,
  SPONSOR_TIERS,
  type SponsorCardData,
  type SponsorTierId,
} from "@/lib/sponsors";
import { HeadlineBillboard, SPONSOR_ASPECT, sponsorShellClass } from "./SponsorShowcase";
import { useDict } from "@/lib/i18n/client";
import type { Dictionary } from "@/lib/i18n/dictionary";

type TierKey = "headline" | "gold" | "silver" | "bronze";

function tierCopy(dict: Dictionary, tier: SponsorTierId) {
  const key = (tier === "starter" ? "bronze" : tier) as TierKey;
  return dict.sponsors[key];
}

function becomeCta(dict: Dictionary, tier: SponsorTierId) {
  if (tier === "headline") return dict.sponsors.becomeHeadline;
  if (tier === "gold") return dict.sponsors.becomeGold;
  if (tier === "silver") return dict.sponsors.becomeSilver;
  return dict.sponsors.becomeBronze;
}

function Wrap({
  url,
  className,
  children,
}: {
  url: string | null;
  className?: string;
  children: ReactNode;
}) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

function SponsorFrame({
  sponsor,
  size,
  tier,
}: {
  sponsor: SponsorCardData;
  size: "preview" | "home" | "page";
  tier: SponsorTierId;
}) {
  return (
    <Wrap url={sponsor.url} className="block">
      <HeadlineBillboard
        name={sponsor.name}
        tagline={sponsor.tagline}
        logo={sponsor.logo}
        size={size}
        tier={tier}
        example={isExampleSponsor(sponsor.name)}
      />
    </Wrap>
  );
}

function EmptySponsorFrame({ tier }: { tier: SponsorTierId }) {
  const dict = useDict();
  const meta = SPONSOR_TIERS.find((t) => t.id === tier);
  if (!meta) return null;
  const copy = tierCopy(dict, tier);

  return (
    <Link href={sponsorSignupHref(tier)} className="block h-full">
      <div className={sponsorShellClass(tier, "@container h-full")}>
        <div
          className={`flex h-full w-full flex-col items-center justify-center bg-black px-[5cqi] text-center ${SPONSOR_ASPECT[tier]}`}
        >
          <p className="font-display text-[length:clamp(0.45rem,5.6cqi,0.95rem)] leading-none tracking-wide text-yellow">
            {copy.name}
          </p>
          <p className="mt-[1.4cqi] font-display text-[length:clamp(0.42rem,5cqi,0.85rem)] leading-none text-yellow/85">
            {meta.priceLabel}
          </p>
          <p className="mt-[2cqi] text-[length:clamp(0.36rem,4.2cqi,0.7rem)] leading-tight text-yellow/55">
            {dict.sponsors.putAdHere}
          </p>
          <span className="mt-[3cqi] inline-flex bg-yellow px-[3.8cqi] py-[1.7cqi] font-display text-[length:clamp(0.34rem,3.7cqi,0.62rem)] uppercase leading-none tracking-wide text-black">
            {becomeCta(dict, tier)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyFrame({ tier }: { tier: SponsorTierId }) {
  return <EmptySponsorFrame tier={tier} />;
}

export function HeadlineOfferBar() {
  const dict = useDict();
  const tier = SPONSOR_TIERS.find((t) => t.id === "headline");
  if (!tier) return null;
  const copy = dict.sponsors.headline;
  return (
    <div>
      <p className="font-display text-4xl tracking-tight text-yellow md:text-6xl lg:text-7xl">
        {dict.sponsors.headlineOfferTitle}
      </p>
      <p className="mt-4 max-w-2xl text-white/75">
        {copy.placement}. {dict.sponsors.headlineOfferBody}
      </p>
      <ul className="mt-5 grid max-w-3xl gap-1.5 sm:grid-cols-2">
        {copy.perks.map((p) => (
          <li key={p} className="text-white/80">
            — {p}
          </li>
        ))}
      </ul>
      <Link
        href={sponsorSignupHref("headline")}
        className="mt-6 inline-flex bg-yellow px-5 py-3 font-display text-sm tracking-[0.12em] text-black"
      >
        {dict.sponsors.becomeHeadline}
      </Link>
    </div>
  );
}

export function CompactHeadlineBar({ sponsor }: { sponsor: SponsorCardData }) {
  return (
    <Wrap url={sponsor.url} className="block">
      <HeadlineBillboard
        name={sponsor.name}
        tagline={sponsor.tagline}
        logo={sponsor.logo}
        size="home"
        tier="headline"
      />
    </Wrap>
  );
}

export function HeadlineHomeRow({ sponsor }: { sponsor: SponsorCardData | null }) {
  const dict = useDict();
  const tier = SPONSOR_TIERS.find((t) => t.id === "headline");
  if (!tier) return null;
  return (
    <div>
      <p className="font-display text-[0.8rem] tracking-[0.28em] text-yellow">
        {dict.sponsors.headline.name} · {tier.priceLabel}
      </p>
      <div className="mt-4">
        {sponsor ? (
          <CompactHeadlineBar sponsor={sponsor} />
        ) : (
          <div className={sponsorShellClass("headline")}>
            <div className="px-5 py-8 md:py-12">
              <HeadlineOfferBar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeadlineSponsor({ sponsor }: { sponsor: SponsorCardData }) {
  return (
    <Wrap url={sponsor.url} className="block">
      <HeadlineBillboard
        name={sponsor.name}
        tagline={sponsor.tagline}
        logo={sponsor.logo}
        size="page"
        tier="headline"
        example={isExampleSponsor(sponsor.name)}
      />
    </Wrap>
  );
}

export function GoldHomeRow({ sponsors }: { sponsors: SponsorCardData[] }) {
  const dict = useDict();
  const real = sponsors.filter((s) => !isExampleSponsor(s.name));
  const tier = SPONSOR_TIERS.find((t) => t.id === "gold");
  if (!tier) return null;

  const left = real[0];
  const right = real[1];
  const extra = real.slice(2);

  return (
    <div>
      <p className="font-display text-[0.8rem] tracking-[0.28em] text-yellow">
        {dict.sponsors.gold.name} · {tier.priceLabel}
      </p>
      <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2 md:gap-6">
        {left ? <SponsorFrame sponsor={left} size="home" tier="gold" /> : <EmptyFrame tier="gold" />}
        {right ? <SponsorFrame sponsor={right} size="home" tier="gold" /> : <EmptyFrame tier="gold" />}
      </div>
      {extra.length ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-6">
          {extra.map((s) => (
            <SponsorFrame key={`gh-${s.name}`} sponsor={s} size="home" tier="gold" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function fillRow<T>(items: T[], size: number) {
  const rows = Math.max(1, Math.ceil(items.length / size));
  return Array.from({ length: rows * size }, (_, i) => items[i] ?? null);
}

export function SilverHomeRow({ sponsors }: { sponsors: SponsorCardData[] }) {
  const dict = useDict();
  const real = sponsors.filter((s) => !isExampleSponsor(s.name));
  const tier = SPONSOR_TIERS.find((t) => t.id === "silver");
  if (!tier) return null;
  const slots = fillRow(real, 4);

  return (
    <div>
      <p className="font-display text-[0.8rem] tracking-[0.28em] text-yellow">
        {dict.sponsors.silver.name} · {tier.priceLabel}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {slots.map((s, i) =>
          s ? (
            <SponsorFrame key={`sh-${s.name}`} sponsor={s} size="home" tier="silver" />
          ) : (
            <EmptyFrame key={`se-${i}`} tier="silver" />
          ),
        )}
      </div>
    </div>
  );
}

export function BronzeHomeRow({ sponsors }: { sponsors: SponsorCardData[] }) {
  const dict = useDict();
  const real = sponsors.filter((s) => !isExampleSponsor(s.name));
  const tier = SPONSOR_TIERS.find((t) => t.id === "bronze");
  if (!tier) return null;
  const slots = fillRow(real, 4);

  return (
    <div>
      <p className="font-display text-[0.8rem] tracking-[0.28em] text-yellow">
        {dict.sponsors.bronze.name} · {tier.priceLabel}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {slots.map((s, i) =>
          s ? (
            <SponsorFrame key={`bh-${s.name}`} sponsor={s} size="home" tier="bronze" />
          ) : (
            <EmptyFrame key={`be-${i}`} tier="bronze" />
          ),
        )}
      </div>
    </div>
  );
}

export function SponsorPlacements({
  sponsors,
  showCta = true,
}: {
  sponsors: SponsorCardData[];
  showCta?: boolean;
}) {
  const dict = useDict();
  const g = groupSponsors(sponsors);
  if (!sponsors.length) return null;

  return (
    <div className="space-y-14">
      {g.headline.map((s) => (
        <HeadlineSponsor key={`h-${s.name}`} sponsor={s} />
      ))}

      {g.gold.length ? (
        <div>
          <GroupLabel title={`${dict.sponsors.gold.name} · €10.000`} />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {g.gold.map((s) => (
              <SponsorFrame key={`g-${s.name}`} sponsor={s} size="page" tier="gold" />
            ))}
          </div>
        </div>
      ) : null}

      {g.silver.length ? (
        <div>
          <GroupLabel title={`${dict.sponsors.silver.name} · €2.500`} />
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {g.silver.map((s) => (
              <SponsorFrame key={`s-${s.name}`} sponsor={s} size="page" tier="silver" />
            ))}
          </div>
        </div>
      ) : null}

      {g.bronze.length ? (
        <div>
          <GroupLabel muted title={`${dict.sponsors.bronze.name} · €500`} />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {g.bronze.map((s) => (
              <SponsorFrame key={`b-${s.name}`} sponsor={s} size="page" tier="bronze" />
            ))}
          </div>
        </div>
      ) : null}

      {showCta ? (
        <Link href={sponsorSignupHref("gold")} className="btn-yellow">
          {dict.sponsors.chooseSpot}
        </Link>
      ) : null}
    </div>
  );
}

function GroupLabel({
  title,
  muted = false,
}: {
  title: string;
  muted?: boolean;
}) {
  return (
    <p className={`font-display ${muted ? "text-base text-white/45" : "text-xl text-yellow md:text-2xl"}`}>
      {title}
    </p>
  );
}

export function LiveDrawSponsorBadge({ sponsor }: { sponsor: SponsorCardData | null }) {
  const dict = useDict();
  if (!sponsor) return null;
  return (
    <div className="absolute bottom-4 right-4 z-10 max-w-[min(100%,22rem)] bg-yellow px-5 py-4 text-black md:bottom-6 md:right-6 md:px-6 md:py-5">
      <p className="font-display text-[0.65rem] tracking-[0.22em]">
        {dict.sponsors.liveDrawWith}
        {isExampleSponsor(sponsor.name) ? ` · ${dict.sponsors.example}` : ""}
      </p>
      <p className="mt-1 font-display text-2xl leading-[0.95] md:text-4xl">{sponsor.name}</p>
    </div>
  );
}
