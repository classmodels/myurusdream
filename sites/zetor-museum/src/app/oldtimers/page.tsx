import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { museumPhotos, otherBrands } from "@/lib/content";

export const metadata: Metadata = {
  title: "Oldtimers",
};

export default function OldtimersPage() {
  const hero =
    museumPhotos.find((p) => p.src.includes("M8_1a")) ?? museumPhotos[7];
  const shots = museumPhotos.filter((p) => p.group === "oldtimer");

  return (
    <>
      <PageHero
        eyebrow="Meer dan Zetor"
        title="Oldtimerhal"
        lead="Hanomag, Lanz, Field Marshall, Landini en nog veel meer — prachtig gerestaureerd, zij aan zij in een aparte museumhal."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section className="border-b border-steel">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-3xl space-y-4 leading-relaxed text-ink-dim">
            <p>
              Het Zetor-museum is meer dan alleen Zetor-tractoren. Herman Michiels begon in
              1979 met landbouwloonwerk. Zijn eerste tractor op het loonbedrijf was een{" "}
              <strong className="text-ink">Hanomag Brillant 600</strong> — vandaar het grote
              aantal Hanomag-tractoren in de verzameling.
            </p>
            <p>
              Herman heeft een ruime visie: in het museum staan ook oldtimers te schitteren van
              onder meer Lanz, Field Marshall, Landini, Pampa, Ursus, Vierzon, Balilla, Favache,
              Fordson, Fahr en meer. Ze zijn op hun beurt prachtig gerestaureerd en staan te
              pronken in een aparte museumhal.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherBrands.map((b) => (
              <article key={b.name} className="rounded-sm border border-steel bg-hangar-2 p-5">
                <h2 className="font-display text-2xl tracking-wide text-zetor">{b.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{b.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-steel bg-hangar-2">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide md:text-5xl">
            Landbouwmachines &amp; werktuigen
          </h2>
          <p className="mt-4 max-w-2xl text-ink-dim leading-relaxed">
            Als slot is het Zetor-museum de thuishaven voor een collectie landbouwmachines en
            landbouwwerktuigen die een goed beeld geven van het landbouwerfgoed van om en rond
            de regio Heist-op-den-Berg.
          </p>
          <div className="mt-8">
            <PhotoGrid photos={museumPhotos.filter((p) => p.group === "machines")} />
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide">Oldtimers in beeld</h2>
          <div className="mt-8">
            <PhotoGrid photos={shots} />
          </div>
        </div>
      </section>
    </>
  );
}
