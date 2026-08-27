import { LegalStamp } from "@/components/LegalStamp";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-28">
      <LegalStamp />
      <h1 className="mt-6 font-display text-5xl">{title}</h1>
      <div className="prose-legal mt-8 space-y-4 text-white/80 leading-relaxed">{children}</div>
    </article>
  );
}
