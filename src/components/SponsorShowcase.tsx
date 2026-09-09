"use client";

import { useState } from "react";
import { isExampleSponsor, type SponsorCardData, type SponsorTierId } from "@/lib/sponsors";
import { useDict } from "@/lib/i18n/client";

export type { SponsorCardData };

export const SPONSOR_ASPECT: Record<SponsorTierId, string> = {
  headline: "aspect-[16/5]",
  gold: "aspect-[2/1]",
  silver: "aspect-[2/1]",
  bronze: "aspect-[2/1]",
  starter: "aspect-[2/1]",
};

export const SPONSOR_FRAME_PAD: Record<SponsorTierId, string> = {
  headline: "p-1.5 sm:p-2",
  gold: "p-1.5 sm:p-2",
  silver: "p-[2px] sm:p-[3px]",
  bronze: "p-px sm:p-[2px]",
  starter: "p-px sm:p-[2px]",
};

export function sponsorShellClass(tier: SponsorTierId, extra = "") {
  const pad = SPONSOR_FRAME_PAD[tier] || SPONSOR_FRAME_PAD.gold;
  return `sponsor-frame-shell w-full ${pad} ${extra}`.trim();
}

export function HeadlineBillboard({
  name,
  tagline,
  logo,
  size = "preview",
  tier = "headline",
  bleed = false,
  emptyLabel,
  example = false,
}: {
  name: string;
  tagline?: string | null;
  logo?: string | null;
  size?: "preview" | "home" | "page";
  tier?: SponsorTierId;
  bleed?: boolean;
  emptyLabel?: string;
  example?: boolean;
}) {
  const dict = useDict();
  const [logoFailed, setLogoFailed] = useState(false);
  const title = name.trim();
  const sub = (tagline || "").trim();
  const showLogo = Boolean(logo) && !logoFailed;
  const titleSize =
    size === "preview" ? "text-sm sm:text-base" : size === "home" ? "text-sm sm:text-lg md:text-xl" : "text-base sm:text-xl md:text-2xl";
  const subSize = size === "preview" ? "text-[0.65rem] sm:text-xs" : "text-[0.65rem] sm:text-sm";
  const fillName =
    size === "preview" ? "text-2xl sm:text-3xl" : tier === "headline" ? "text-4xl sm:text-6xl md:text-7xl" : "text-2xl sm:text-4xl";

  return (
    <div className={bleed ? "w-full" : sponsorShellClass(tier)}>
      <div className={`relative w-full overflow-hidden bg-black ${SPONSOR_ASPECT[tier] || SPONSOR_ASPECT.gold}`}>
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo!}
            alt={title || ""}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-3 text-center">
            <p className={`font-display leading-none tracking-tight text-yellow ${fillName}`}>
              {title || emptyLabel || ""}
            </p>
            {sub ? (
              <p className={`mt-2 max-w-full truncate font-medium text-yellow/70 ${subSize}`}>{sub}</p>
            ) : null}
          </div>
        )}

        {showLogo && title ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-3 py-2">
            <p className={`truncate text-center font-display leading-none tracking-tight text-white ${titleSize}`}>
              {title}
            </p>
          </div>
        ) : null}

        {showLogo && sub ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
            <p className={`truncate text-center font-medium leading-none text-white/90 ${subSize}`}>{sub}</p>
          </div>
        ) : null}

        {example ? (
          <p className="pointer-events-none absolute left-1.5 top-1.5 font-display text-[0.55rem] uppercase tracking-[0.16em] text-white/75">
            {dict.sponsors.example}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SponsorCard({ sponsor }: { sponsor: SponsorCardData }) {
  const tier = (sponsor.tier && sponsor.tier !== "starter" ? sponsor.tier : "bronze") as SponsorTierId;
  const inner = (
    <HeadlineBillboard
      name={sponsor.name}
      tagline={sponsor.tagline}
      logo={sponsor.logo}
      size="page"
      tier={tier}
      example={isExampleSponsor(sponsor.name)}
    />
  );

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noreferrer" className="block hover:opacity-95">
        {inner}
      </a>
    );
  }
  return inner;
}

export function SponsorGrid({ sponsors }: { sponsors: SponsorCardData[] }) {
  if (!sponsors.length) {
    return (
      <p className="text-white/65">
        Nog geen bevestigde sponsoren. De eerste merken die instappen, krijgen de beste plekken.
      </p>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sponsors.map((s) => (
        <SponsorCard key={`${s.name}-${s.cents}`} sponsor={s} />
      ))}
    </div>
  );
}
