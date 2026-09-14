import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { expectItems, museumPhotos, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Bezoek",
};

export default function BezoekPage() {
  const hero = museumPhotos[4];

  return (
    <>
      <PageHero
        eyebrow="Praktische info"
        title="Bezoek het museum"
        lead="Enkel op afspraak voor groepen. Ontdek wat u mag verwachten en plan uw bezoek in Houtvenne."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section className="border-b border-steel">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_0.9fr] md:px-6 md:py-20">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-zetor uppercase">
              Goed om te weten
            </p>
            <h2 className="font-display mt-2 text-4xl tracking-wide md:text-5xl">
              Groepen op afspraak
            </h2>
            <ul className="mt-6 space-y-3 text-ink-dim">
              <li className="rounded-sm border border-steel bg-hangar-2 px-4 py-3">
                Bezoek <strong className="text-ink">enkel op afspraak</strong> voor groepen
              </li>
              <li className="rounded-sm border border-steel bg-hangar-2 px-4 py-3">
                Adres museum: <strong className="text-ink">{site.museumAddress}</strong>
              </li>
              <li className="rounded-sm border border-steel bg-hangar-2 px-4 py-3">
                Contactpersoon: <strong className="text-ink">Herman Michiels</strong>
              </li>
              <li className="rounded-sm border border-steel bg-hangar-2 px-4 py-3">
                Tel:{" "}
                <a href={site.phoneHref} className="font-semibold text-zetor hover:underline">
                  {site.phone}
                </a>
              </li>
              <li className="rounded-sm border border-steel bg-hangar-2 px-4 py-3">
                Mail:{" "}
                <a href={site.emailHref} className="text-ink hover:underline">
                  {site.email}
                </a>
              </li>
            </ul>
            <p className="mt-6 text-sm leading-relaxed text-ink-mute">
              Tip: vermeld bij uw aanvraag de groepsgrootte, gewenste datum/uur en of u vooral
              interesse heeft in de Zetor-hal, oldtimers, archief of landbouwmachines.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={site.phoneHref}
                className="rounded-sm bg-zetor px-5 py-3 text-sm font-semibold text-white hover:bg-zetor-deep"
              >
                Bel voor afspraak
              </a>
              <Link
                href="/contact"
                className="rounded-sm border border-ink/20 px-5 py-3 text-sm font-semibold text-ink"
              >
                Contactpagina
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-steel">
            <iframe
              title="Kaart Provinciebaan 3 Houtvenne"
              src={site.mapEmbed}
              className="h-[22rem] w-full md:h-full min-h-[22rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-steel bg-hangar-2">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide md:text-5xl">
            Wat bezoekers te zien krijgen
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expectItems.map((item) => (
              <article key={item.title} className="rounded-sm border border-steel bg-hangar p-5">
                <h3 className="font-display text-2xl tracking-wide">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl tracking-wide">Sfeerimpressie</h2>
          <div className="mt-8">
            <PhotoGrid photos={museumPhotos.slice(0, 9)} />
          </div>
        </div>
      </section>
    </>
  );
}
