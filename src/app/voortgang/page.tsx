import type { Metadata } from "next";
import Link from "next/link";
import { PreviewBoard } from "@/components/PreviewBoard";

export const metadata: Metadata = {
  title: "Voortgang",
  description: "Bekijk de voortgang van websites in ontwikkeling en geef feedback — met toegangscode.",
};

export default function VoortgangPage() {
  return (
    <>
      <section className="mesh-hero">
        <div className="container-x py-10 md:py-20">
          <p className="eyebrow">Klantpreview</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Alle sites in opbouw. Eén link.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft">
            Elke klant opent hier het eigen project met een toegangscode — of krijgt een directe link
            zoals /test/1. U zet de voorbeelden klaar via beheer.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x">
          <PreviewBoard />
          <p className="mt-8 text-xs text-muted">
            SiteButler:{" "}
            <Link href="/voortgang/beheer" className="font-semibold text-teal hover:underline">
              site toevoegen
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
