import type { ReactNode } from "react";

export function PageHero({
  title,
  kicker,
  image = "/images/urus-villa.png",
  titleClassName,
  compact,
  heading = "h1",
  embedded = false,
  children,
  contentClassName,
  overlay,
  overlayPlacement = "inline",
}: {
  title: ReactNode;
  kicker?: string;
  image?: string;
  titleClassName?: string;
  compact?: boolean;
  heading?: "h1" | "h2";
  embedded?: boolean;
  children?: ReactNode;
  contentClassName?: string;
  overlay?: ReactNode;
  overlayPlacement?: "inline" | "bottom-right";
}) {
  const TitleTag = heading;
  const pad = embedded
    ? "py-14 md:py-20"
    : compact
      ? "pb-8 pt-24 md:pb-10 md:pt-28"
      : overlay
        ? overlayPlacement === "bottom-right"
          ? "pb-10 pt-28 md:pb-28 md:pt-32"
          : "pb-10 pt-28 md:pb-14 md:pt-32"
        : "pb-14 pt-28 md:pb-20 md:pt-32";
  return (
    <section className="relative isolate overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/35" />
      <div className={`relative mx-auto max-w-7xl px-5 ${pad}`}>
        {kicker ? (
          <p className="font-display text-[0.8rem] tracking-[0.35em] text-yellow">{kicker}</p>
        ) : null}
        <TitleTag
          className={`mt-3 font-display ${
            titleClassName ?? "max-w-4xl text-4xl md:text-6xl"
          }`}
        >
          {title}
        </TitleTag>
        {children || overlay ? (
          <div
            className={
              overlay && overlayPlacement === "inline"
                ? "mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
                : contentClassName ?? "mt-4 max-w-2xl text-white/80"
            }
          >
            {children ? (
              <div
                className={
                  overlay && overlayPlacement === "inline"
                    ? contentClassName ?? "max-w-2xl text-white/80"
                    : undefined
                }
              >
                {children}
              </div>
            ) : null}
            {overlay && overlayPlacement === "inline" ? overlay : null}
          </div>
        ) : null}
        {overlay && overlayPlacement === "bottom-right" ? (
          <div className="hidden md:absolute md:bottom-8 md:right-5 md:block">{overlay}</div>
        ) : null}
      </div>
    </section>
  );
}

