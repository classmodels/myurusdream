import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { OfferteForm } from "@/components/OfferteForm";

export const metadata: Metadata = {
  title: "Offerte aanvragen",
  description: "Vraag een vrijblijvende offerte voor uw website. Reactie binnen 24 uur.",
};

export default function OffertePage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-14 md:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Offerte</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-extrabold text-ink md:text-5xl">
            Vraag een vrijblijvende offerte aan.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Beschrijf uw noden zo concreet mogelijk. U ontvangt binnen 24 uur een gestructureerd voorstel.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.7fr]">
          <Suspense fallback={<div className="card h-96 animate-pulse" />}>
            <OfferteForm />
          </Suspense>
          <aside className="space-y-4">
            <div className="card p-6">
              <h2 className="font-bold text-ink-on-light">Vervolgstappen</h2>
              <ol className="mt-3 space-y-2 text-sm text-muted-on-light">
                <li>1. Analyse van uw aanvraag en bijlagen</li>
                <li>2. Offerte binnen 24 uur</li>
                <li>3. Na akkoord: concept binnen 48 uur</li>
                <li>4. Realisatie, livegang en support</li>
              </ol>
            </div>
            <div className="card p-6">
              <h2 className="font-bold text-ink-on-light">Richtprijzen</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-on-light">
                <li>Essentie — €1.250</li>
                <li>Compleet — €2.995</li>
                <li>Op maat — op aanvraag</li>
              </ul>
              <Link href="/prijzen" className="mt-4 inline-block text-sm font-bold text-blue-deep">Alle prijzen →</Link>
            </div>
            <div className="card p-6">
              <h2 className="font-bold text-ink-on-light">Bestanden klaar?</h2>
              <p className="mt-2 text-sm text-muted-on-light">Lever ze aan via het briefingportaal.</p>
              <Link href="/briefing" className="btn-primary mt-4 inline-flex text-sm">Naar briefing</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
