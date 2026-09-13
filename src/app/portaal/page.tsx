import type { Metadata } from "next";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";
import { listHostedSites } from "@/lib/hosted-sites";

export const metadata: Metadata = {
  title: "Klantportaal",
  description: "Bekijk de live website in het SiteButler-klantportaal.",
};

export default function PortaalLoginPage() {
  const live = listHostedSites()[0];
  const liveHref = live?.basePath || "/portaal/myurusdream";

  return (
    <section className="mesh-hero">
      <div className="container-x py-8 md:py-10">
        <p className="eyebrow">Klantportaal</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink md:text-4xl">
            Uw website
          </h1>
          <a href={liveHref} className="btn-soft !px-4 !py-2 text-sm">
            Open in nieuw tabblad
          </a>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Dit is de live klantsite in het portaal.
        </p>
        <div className="mt-6 overflow-hidden rounded-tr-2xl ring-1 ring-line">
          <iframe title="Live klantsite" src={liveHref} className="h-[80vh] w-full bg-white" />
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <p className="mb-3 text-sm font-semibold text-ink">Stappenplan (offerte, contract, feedback)</p>
          <PortalLoginForm />
        </div>
      </div>
    </section>
  );
}
