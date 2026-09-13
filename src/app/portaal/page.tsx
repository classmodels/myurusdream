import type { Metadata } from "next";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export const metadata: Metadata = {
  title: "Klantportaal",
  description: "Log in om uw eigen website in het SiteButler-portaal te zien.",
};

export default function PortaalLoginPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow">Klantportaal</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
              Elke klant ziet hier zijn eigen website.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              Log in met de gegevens die u van SiteButler kreeg. Daarna ziet u alleen uw site — niet die van andere klanten.
            </p>
          </div>
          <PortalLoginForm />
        </div>
      </div>
    </section>
  );
}
