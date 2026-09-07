import type { ReactNode } from "react";

export function Accordion({
  title,
  description,
  children,
  className = "mt-12",
  compact = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <details className={`${className} border border-white/10`}>
      <summary
        className={`flex cursor-pointer list-none items-center justify-between gap-4 font-display marker:content-none [&::-webkit-details-marker]:hidden ${
          compact ? "px-4 py-3 text-xl" : "px-5 py-4 text-2xl md:text-3xl"
        }`}
      >
        <span>{title}</span>
        <span className="accordion-mark shrink-0 text-yellow" aria-hidden />
      </summary>
      {description ? <p className="px-5 pb-3 text-sm text-white/70">{description}</p> : null}
      <div className="border-t border-white/10">{children}</div>
    </details>
  );
}
