import type { ReactNode } from "react";

export function Accordion({
  title,
  description,
  children,
  className = "mt-12",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`${className} border border-white/10`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-2xl marker:content-none md:text-3xl [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="accordion-mark shrink-0 text-yellow" aria-hidden />
      </summary>
      {description ? <p className="px-5 pb-3 text-white/70">{description}</p> : null}
      <div className="border-t border-white/10">{children}</div>
    </details>
  );
}
