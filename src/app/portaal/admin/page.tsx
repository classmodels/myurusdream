import type { Metadata } from "next";
import { PortalAdmin } from "@/components/portal/PortalAdmin";

export const metadata: Metadata = {
  title: "Admin backstage",
  robots: { index: false, follow: false },
};

export default function PortaalAdminPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <p className="eyebrow">SiteButler</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink md:text-4xl">
          Administrator backstage
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Overzicht van alle klantkaarten. Open een kaart om site te koppelen, wachtwoord te beheren,
          berichten te sturen en uploads/aanvragen te bekijken.
        </p>
        <div className="mt-8">
          <PortalAdmin />
        </div>
      </div>
    </section>
  );
}
