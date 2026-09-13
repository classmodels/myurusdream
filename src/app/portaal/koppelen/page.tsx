import type { Metadata } from "next";
import { PortalKoppelen } from "@/components/portal/PortalKoppelen";

export const metadata: Metadata = {
  title: "Klant aan site koppelen",
  robots: { index: false, follow: false },
};

export default function PortaalKoppelenPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <p className="eyebrow">SiteButler</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
          Site koppelen aan een klant
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Vul e-mail, wachtwoord en de live site in. Die klant logt daarna in op het portaal en ziet alleen die site.
        </p>
        <div className="mt-8">
          <PortalKoppelen />
        </div>
      </div>
    </section>
  );
}
