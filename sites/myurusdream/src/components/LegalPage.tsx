import { PageHero } from "@/components/PageHero";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="pb-24">
      <PageHero kicker="Juridisch" title={title} image="/images/urus-villa.png" compact />
      <div className="mx-auto mt-5 max-w-7xl px-5">
        <div className="prose-legal max-w-3xl space-y-4 text-left text-[0.8rem] leading-normal text-white/80">
          {children}
        </div>
      </div>
    </article>
  );
}
