import type { Metadata } from "next";
import Link from "next/link";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export const metadata: Metadata = {
  title: "Klantportaal",
  description: "Log in om uw websiteproject op te volgen, materiaal te uploaden en feedback te geven.",
};

export default function PortaalLoginPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow">Klantportaal</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
              Volg uw project. Lever materiaal. Geef feedback.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              Eén overzichtelijke plek: offerte, digitaal contract, uploads, preview en comments —
              zodat u altijd ziet waar we staan.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              <li>✓ Stappenplan met voortgangsbalk</li>
              <li>✓ Digitaal contract ondertekenen</li>
              <li>✓ Logo, teksten en foto&apos;s uploaden</li>
              <li>✓ Preview + commentaar op het ontwerp</li>
            </ul>
            <p className="mt-6 text-sm text-ink-soft">
              Nog geen account?{" "}
              <Link href="/offerte" className="font-semibold text-teal hover:underline">
                Vraag eerst een offerte
              </Link>
              .
            </p>
          </div>
          <PortalLoginForm />
        </div>
      </div>
    </section>
  );
}
