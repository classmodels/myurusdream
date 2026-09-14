import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { museumPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Galerij",
};

const groups = [
  { id: "hal", label: "Museumhal" },
  { id: "detail", label: "Tractors & details" },
  { id: "oldtimer", label: "Oldtimers" },
  { id: "machines", label: "Landbouwmachines" },
] as const;

export default function GalerijPage() {
  const hero = museumPhotos[22] ?? museumPhotos[0];

  return (
    <>
      <PageHero
        eyebrow={`${museumPhotos.length}+ foto’s`}
        title="Fotogalerij"
        lead="Echte beelden uit het Zetormuseum in Houtvenne — hallen, tractoren, oldtimers en landbouwerfgoed."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section>
        <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:px-6 md:py-20">
          {groups.map((g) => {
            const photos = museumPhotos.filter((p) => p.group === g.id);
            if (!photos.length) return null;
            return (
              <div key={g.id} id={g.id}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <h2 className="font-display text-3xl tracking-wide md:text-4xl">{g.label}</h2>
                  <p className="text-sm text-ink-mute">{photos.length} foto’s</p>
                </div>
                <PhotoGrid photos={photos} columns={g.id === "machines" ? 3 : 3} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
