import type { Metadata } from "next";
import { PreviewStudio } from "@/components/PreviewStudio";

export const metadata: Metadata = {
  title: "Voortgang beheren",
  robots: { index: false, follow: false },
};

export default function VoortgangBeheerPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <p className="eyebrow">SiteButler</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
          Testsites 1 tot 10
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Kies een nummer, vul de site in, zet zichtbaar. Dan staat ze live op www.sitebutler.be/sitenaam.
        </p>
        <div className="mt-8">
          <PreviewStudio />
        </div>
      </div>
    </section>
  );
}
