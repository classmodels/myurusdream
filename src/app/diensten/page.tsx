import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/CtaBand";
import { ServiceOverviewCards } from "@/components/ServicePageShell";

export const metadata: Metadata = {
  title: "Diensten",
  description:
    "Websites, logo, teksten, fotografie, video en Butler Care — kies wat u nodig heeft bij SiteButler.",
};

export default function DienstenPage() {
  return (
    <>
      <CtaBand
        withMesh
        className=""
        title="Welke modules heeft uw project nodig?"
        text="Kies hieronder de dienst die u zoekt. Elke pagina toont alleen wat daarbij hoort — helder en zonder overbodige informatie."
        sideEyebrow="Diensten"
        sideTitle="Een volledig digitaal traject, of enkel wat u nodig heeft."
        sideAsH1
      />

      <section className="section -mt-6 pt-0 md:-mt-10">
        <div className="container-x">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">Overzicht</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink md:text-3xl">
              Wat wij voor u doen
            </h2>
            <p className="mt-2 text-ink-soft">
              Klik door naar de dienst die bij u past. Prijzen vindt u apart onder Prijzen.
            </p>
          </div>
          <ServiceOverviewCards />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/prijzen" className="btn-primary text-sm">
              Bekijk prijzen
            </Link>
            <Link href="/offerte" className="btn-secondary text-sm">
              Offerte aanvragen
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
