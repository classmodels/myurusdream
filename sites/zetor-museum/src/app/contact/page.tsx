import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { museumPhotos, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const hero = museumPhotos[5];

  return (
    <>
      <PageHero
        eyebrow="Afspraak maken"
        title="Contact"
        lead="Neem contact op met Herman Michiels voor een groepsbezoek aan het Zetormuseum of vragen over de collectie."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20">
          <div className="space-y-8">
            <div className="rounded-sm border border-steel bg-hangar-2 p-6">
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brass uppercase">
                Zetormuseum
              </p>
              <p className="mt-3 text-lg text-ink">{site.museumAddress}</p>
              <p className="mt-2 text-sm text-ink-dim">Bezoek enkel op afspraak voor groepen</p>
              <p className="mt-4">
                <span className="text-sm text-ink-mute">Contact · </span>
                <span className="font-semibold">Herman Michiels</span>
              </p>
              <p className="mt-2">
                <a href={site.phoneHref} className="font-display text-3xl tracking-wide text-zetor">
                  {site.phone}
                </a>
              </p>
              <p className="mt-2">
                <a href={site.emailHref} className="text-ink-dim hover:text-ink">
                  {site.email}
                </a>
              </p>
            </div>

            <div className="rounded-sm border border-steel bg-hangar-2 p-6">
              <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brass uppercase">
                Loonwerken / URZET
              </p>
              <p className="mt-3 text-ink">Michiels H. Landbouwwerken</p>
              <p className="text-sm text-ink-dim">{site.companyAddress}</p>
              <p className="mt-3 text-sm text-ink-mute">
                URZET-Services: aankoop/verkoop, onderhoud, restauratie en onderdelen voor Zetor
                &amp; Ursus — met rechtstreekse link naar het museum.
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-steel bg-hangar-2 p-6 md:p-8">
            <h2 className="font-display text-3xl tracking-wide">Stuur een bericht</h2>
            <p className="mt-2 text-sm text-ink-dim">
              Demo-formulier (lokaal). In productie koppelt u dit aan e-mail of een CRM.
            </p>
            <form className="mt-6 space-y-4" action={site.emailHref} method="get">
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-mute">Naam</span>
                <input
                  name="name"
                  className="w-full rounded-sm border border-steel bg-hangar px-3 py-2.5 text-ink outline-none focus:border-zetor"
                  placeholder="Uw naam"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-mute">E-mail</span>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-sm border border-steel bg-hangar px-3 py-2.5 text-ink outline-none focus:border-zetor"
                  placeholder="naam@voorbeeld.be"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-mute">Onderwerp</span>
                <input
                  name="subject"
                  className="w-full rounded-sm border border-steel bg-hangar px-3 py-2.5 text-ink outline-none focus:border-zetor"
                  placeholder="Afspraak groepsbezoek"
                  defaultValue="Afspraak groepsbezoek Zetormuseum"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-mute">Bericht</span>
                <textarea
                  name="body"
                  rows={5}
                  className="w-full rounded-sm border border-steel bg-hangar px-3 py-2.5 text-ink outline-none focus:border-zetor"
                  placeholder="Datum, groepsgrootte, interesse…"
                />
              </label>
              <button
                type="submit"
                className="inline-flex rounded-sm bg-zetor px-5 py-3 text-sm font-semibold text-white hover:bg-zetor-deep"
              >
                Mail openen
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
