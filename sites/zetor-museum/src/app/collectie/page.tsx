import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { museumPhotos, zetorModels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Zetor-collectie",
};

export default function CollectiePage() {
  const hero = museumPhotos[2];
  const zetorShots = [
    ...museumPhotos.filter((p) => p.group === "hal").slice(0, 8),
    ...museumPhotos.filter((p) => p.group === "detail").slice(0, 10),
  ];

  return (
    <>
      <PageHero
        eyebrow="Uniek in de wereld"
        title="De Zetor-collectie"
        lead="Van de eerste Zetor 25 via Super 35 en 50 tot UR1 en Crystal — grotendeels technisch én optisch puntgaaf gerestaureerd."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section className="border-b border-steel">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <div className="max-w-3xl space-y-4 text-ink-dim leading-relaxed">
            <p>
              Het Zetor-museum is breed opgezet rond het Tsjechische merk dat Herman Michiels
              al sinds zijn jeugd na aan het hart ligt. Bezoekers ontdekken een collectie die
              modelseries overbrugt en de evolutie van Zetor tastbaar maakt.
            </p>
            <p>
              Wat opvalt: de afwerking. Het merendeel van de machines is gerestaureerd tot in
              de details — lak, techniek, presentatie — zodat u een museum ervaart dat zowel
              voor kenner als nieuwsgierige bezoeker indruk maakt.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {zetorModels.map((m) => (
              <article key={m.name} className="rounded-sm border border-steel bg-hangar-2 p-6">
                <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brass uppercase">
                  {m.era}
                </p>
                <h2 className="font-display mt-2 text-3xl tracking-wide">{m.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-dim">{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-hangar-2">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide md:text-5xl">In de Zetor-hal</h2>
          <p className="mt-3 max-w-2xl text-ink-dim">
            Echte sfeerbeelden uit het museum: tractoren op rij, emaille reclameborden,
            vitrines en de typische hangaratmosfeer.
          </p>
          <div className="mt-8">
            <PhotoGrid photos={zetorShots} columns={3} />
          </div>
        </div>
      </section>
    </>
  );
}
