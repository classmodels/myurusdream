import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met SiteButler voor websiteontwikkeling en content.",
};

export default function ContactPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x grid gap-8 py-10 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Laten we uw project bespreken.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Bel of mail ons, of start meteen met een offerteaanvraag. Wij reageren doorgaans
            dezelfde werkdag.
          </p>
          <ul className="mt-8 space-y-3">
            <li className="card px-5 py-4 text-ink-on-light"><span className="font-bold">E-mail:</span> {brand.email}</li>
            <li className="card px-5 py-4 text-ink-on-light"><span className="font-bold">Telefoon:</span> {brand.phone}</li>
            <li className="card px-5 py-4 text-ink-on-light"><span className="font-bold">Support:</span> 24/7 voor actieve projecten</li>
          </ul>
        </div>
        <div className="card p-7">
          <h2 className="text-xl font-bold text-ink-on-light">Snel starten</h2>
          <p className="mt-2 text-sm text-muted-on-light">Kies het traject dat bij u past.</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/offerte" className="btn-primary">Offerte aanvragen</Link>
            <Link href="/briefing" className="btn-secondary">Briefing uploaden</Link>
            <Link href="/prijzen" className="inline-flex items-center justify-center rounded-md border border-[#cdd8e8] px-5 py-3 text-sm font-semibold text-ink-on-light">
              Prijzen bekijken
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
