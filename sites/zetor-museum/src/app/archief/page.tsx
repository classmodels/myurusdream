import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { archiveItems, museumPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Archief",
};

export default function ArchiefPage() {
  const hero = museumPhotos[3];

  return (
    <>
      <PageHero
        eyebrow="Breed opgezet"
        title="Archief & memorabilia"
        lead="Prospectussen, handleidingen, wisselstukkenboeken, miniaturen, gadgets, zeldzame foto’s en kalenders — allemaal Zetor."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section className="border-b border-steel">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <p className="max-w-3xl leading-relaxed text-ink-dim">
            Het museum is breed opgezet. Bezoekers maken niet alleen kennis met de tractoren,
            maar ook met een gestaag groeiende documentaire en verzamelcollectie die de merkgeschiedenis
            van Zetor tastbaar maakt — van papier tot miniatuur.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archiveItems.map((item) => (
              <article key={item.title} className="rounded-sm border border-steel bg-hangar-2 p-5">
                <h2 className="font-display text-2xl tracking-wide">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-hangar-2">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide">Sfeer in de hallen</h2>
          <p className="mt-3 max-w-2xl text-ink-dim">
            Vitrines, reclameborden en details die het archief tot leven brengen naast de machines.
          </p>
          <div className="mt-8">
            <PhotoGrid photos={museumPhotos.filter((p) => p.group === "hal").slice(0, 9)} />
          </div>
        </div>
      </section>
    </>
  );
}
