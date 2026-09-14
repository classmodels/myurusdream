import { AssetImage as Image } from "@/components/AssetImage";
import Link from "next/link";

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1526664781949-af414dc24053?auto=format&fit=crop&w=2400&q=80",
  closeup:
    "https://images.unsplash.com/photo-1691933607480-b6712dbdb417?auto=format&fit=crop&w=1600&q=80",
  field:
    "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=1600&q=80",
  grass:
    "https://images.unsplash.com/photo-1662390275440-75a28e4a768f?auto=format&fit=crop&w=1400&q=80",
  harvest:
    "https://images.unsplash.com/photo-1606494403002-227295d7b895?auto=format&fit=crop&w=1400&q=80",
  classic:
    "https://images.unsplash.com/photo-1631141089933-3dbae5d5c69e?auto=format&fit=crop&w=1400&q=80",
};

const COLLECTION = [
  {
    title: "Zetor 25",
    era: "De oorsprong",
    text: "Van de allereerste legendes tot gerestaureerde schoonheden — de basis van een levenslange passie.",
    img: IMAGES.closeup,
  },
  {
    title: "Super 35 & 50",
    era: "Krachtlijnen",
    text: "Technisch én optisch puntgaaf. Een collectie die wereldwijd uniek is in haar volledigheid.",
    img: IMAGES.field,
  },
  {
    title: "UR1 & Crystal",
    era: "Iconische series",
    text: "De modelreeksen die generaties boeren en loonwerkers meenamen over de akkers van Europa.",
    img: IMAGES.grass,
  },
];

const BRANDS = [
  "Hanomag",
  "Lanz",
  "Field Marshall",
  "Landini",
  "Pampa",
  "Ursus",
  "Vierzon",
  "Balilla",
  "Favache",
  "Fordson",
  "Fahr",
];

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* HERO — originele samenstelling */}
      <section id="top" className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={IMAGES.hero}
            alt="Vintage rode tractor in het veld"
            fill
            priority
            className="anim-ken object-cover object-[center_40%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-hangar via-hangar/75 to-hangar/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-hangar via-transparent to-hangar/50" />
          <div className="grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="anim-mark mb-4 inline-flex items-center gap-3 text-[0.7rem] font-semibold tracking-[0.28em] text-brass uppercase">
              <span className="h-px w-10 bg-brass/70" />
              Houtvenne · België
            </p>
            <h1 className="anim-rise font-display max-w-5xl text-[clamp(3.4rem,12vw,8.5rem)] leading-[0.88] tracking-[0.02em] text-ink">
              ZETOR
              <span className="block text-zetor">MUSEUM</span>
            </h1>
            <p className="anim-rise-delay mt-6 max-w-xl text-lg leading-relaxed text-ink-dim md:text-xl">
              Paradijs voor liefhebbers van landbouwmachines en oldtimertractoren —
              een unieke collectie, gerestaureerd tot in de puntjes.
            </p>
            <div className="anim-rise-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/collectie"
                className="rounded-sm bg-zetor px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-zetor-deep"
              >
                Ontdek de collectie
              </Link>
              <Link
                href="/bezoek"
                className="rounded-sm border border-ink/25 bg-hangar/40 px-6 py-3 text-sm font-semibold tracking-wide text-ink backdrop-blur-sm transition hover:border-ink/50"
              >
                Bezoek op afspraak
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VERHAAL */}
      <section id="verhaal" className="relative border-t border-steel">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:px-8 md:py-28">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-zetor uppercase">
              Drijvende kracht
            </p>
            <h2 className="font-display mt-3 text-5xl tracking-wide text-ink md:text-6xl">
              Herman Michiels
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-dim">
              In de regio bekend als bedrijfsleider van loonwerken Michiels H. aan de
              Koppenstraat in Booischot. Het Tsjechische merk Zetor ligt hem sinds zijn
              jeugdjaren nauw aan het hart.
            </p>
            <p className="mt-4 leading-relaxed text-ink-mute">
              De eerste tractor die zijn vader Jules Michiels aankocht in januari 1966
              was een Zetor. Die sympathie bleef — en groeide uit tot een collectie van
              de Zetor 25 via Super 35 en 50 tot de UR1- en Crystal-series. Het merendeel
              is technisch én optisch zo gerestaureerd dat men kan stellen: uniek in de
              wereld.
            </p>
            <blockquote className="mt-10 border-l-2 border-brass pl-5 text-xl leading-snug text-ink italic md:text-2xl">
              “Van jeugdherinnering tot museumhal — staalschuur vol verhalen.”
            </blockquote>
            <Link
              href="/verhaal"
              className="mt-6 inline-block text-sm font-semibold text-zetor hover:underline"
            >
              Lees het volledige verhaal →
            </Link>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden rounded-sm md:min-h-full">
            <Image
              src={IMAGES.closeup}
              alt="Close-up van een gerestaureerde oldtimertractor"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 metal-edge opacity-80" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-hangar to-transparent p-6">
              <p className="font-display text-3xl tracking-wide text-ink">Sinds 1966</p>
              <p className="text-sm text-ink-dim">De eerste Zetor van de familie Michiels</p>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIE */}
      <section id="collectie" className="border-t border-steel bg-hangar-2">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-brass uppercase">
              De Zetor-lijn
            </p>
            <h2 className="font-display mt-3 text-5xl tracking-wide md:text-6xl">
              Collectie in beweging
            </h2>
            <p className="mt-4 text-ink-dim">
              Breed opgezet: tractoren, prospectussen, gebruikshandleidingen, wisselstukkenboeken,
              miniaturen, gadgets, zeldzame foto’s en kalenders — allemaal Zetor.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {COLLECTION.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-sm bg-steel/40">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-hangar via-hangar/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brass uppercase">
                      {item.era}
                    </p>
                    <h3 className="font-display mt-1 text-3xl tracking-wide">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-dim">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Link
            href="/collectie"
            className="mt-8 inline-block text-sm font-semibold text-zetor hover:underline"
          >
            Meer over de Zetor-collectie →
          </Link>
        </div>
      </section>

      {/* MEER DAN ZETOR */}
      <section id="meer" className="relative overflow-hidden border-t border-steel">
        <div className="absolute inset-0">
          <Image
            src={IMAGES.harvest}
            alt="Tractor op het veld"
            fill
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hangar/85" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-zetor uppercase">
            Meer dan Zetor
          </p>
          <h2 className="font-display mt-3 max-w-3xl text-5xl tracking-wide md:text-6xl">
            Oldtimers die zij aan zij schitteren
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-dim">
            Herman begon in 1979 met landbouwloonwerk. Zijn eerste inzettractor was een
            Hanomag Brillant 600 — vandaar de sterke Hanomag-lijn. In een aparte museumhal
            staan prachtig gerestaureerde merken te pronken.
          </p>
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {BRANDS.map((brand) => (
              <li
                key={brand}
                className="rounded-sm border border-ink/15 bg-hangar/50 px-4 py-2 text-sm tracking-wide text-ink backdrop-blur-sm"
              >
                {brand}
              </li>
            ))}
          </ul>
          <Link
            href="/oldtimers"
            className="mt-8 inline-block text-sm font-semibold text-zetor hover:underline"
          >
            Ontdek de oldtimerhal →
          </Link>
        </div>
      </section>

      {/* ERFGOED + ARCHIEF */}
      <section className="border-t border-steel">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <div className="relative min-h-[18rem] overflow-hidden rounded-sm">
            <Image
              src={IMAGES.classic}
              alt="Klassieke tractor in landschap"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-hangar via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-brass uppercase">
              Landbouwerfgoed
            </p>
            <h2 className="font-display mt-3 text-4xl tracking-wide md:text-5xl">
              Machines &amp; werktuigen
            </h2>
            <p className="mt-5 leading-relaxed text-ink-dim">
              Als slot is het museum thuishaven voor een collectie landbouwmachines en
              werktuigen die een helder beeld geven van het landbouwerfgoed rond
              Heist-op-den-Berg — naast de gestaag groeiende Zetor-archieven van
              documentatie en memorabilia.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Prospectussen", "Origineel drukwerk"],
                ["Handleidingen", "Technische kennis"],
                ["Miniaturen", "Collectorsitems"],
                ["Foto’s & kalenders", "Zeldzaam beeld"],
              ].map(([t, s]) => (
                <div key={t} className="border-t border-steel pt-3">
                  <p className="font-semibold text-ink">{t}</p>
                  <p className="text-ink-mute">{s}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/archief" className="text-sm font-semibold text-zetor hover:underline">
                Archief →
              </Link>
              <Link href="/galerij" className="text-sm font-semibold text-zetor hover:underline">
                Fotogalerij →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BEZOEK */}
      <section id="bezoek" className="border-t border-steel bg-hangar-2">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-28">
          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-zetor uppercase">
              Praktisch
            </p>
            <h2 className="font-display mt-3 text-5xl tracking-wide md:text-6xl">
              Bezoek op afspraak
            </h2>
            <p className="mt-5 max-w-lg text-lg text-ink-dim">
              Groepen zijn welkom — enkel na afspraak, zodat we de hallen rustig voor u
              kunnen openen.
            </p>
            <dl className="mt-10 space-y-5 text-ink">
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
                  Adres
                </dt>
                <dd className="mt-1 text-lg">Provinciebaan 3 — 2235 Houtvenne</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
                  Contact
                </dt>
                <dd className="mt-1 text-lg">Herman Michiels</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-ink-mute uppercase">
                  Telefoon
                </dt>
                <dd className="mt-1">
                  <a
                    href="tel:+32475652636"
                    className="font-display text-4xl tracking-wide text-zetor transition hover:text-ink"
                  >
                    +32 475 65 26 36
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="relative overflow-hidden rounded-sm border border-steel bg-hangar p-8 md:p-10">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-zetor/20 blur-3xl" />
            <p className="font-display relative text-4xl tracking-wide">Plan uw bezoek</p>
            <p className="relative mt-3 text-sm leading-relaxed text-ink-dim">
              Bel of stuur een bericht met gewenste datum, groepsgrootte en interesse
              (Zetor-hal, oldtimers of landbouwmachines).
            </p>
            <a
              href="tel:+32475652636"
              className="relative mt-8 inline-flex rounded-sm bg-zetor px-6 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-zetor-deep"
            >
              Bel Herman
            </a>
            <Link
              href="/bezoek"
              className="relative mt-4 block text-sm font-semibold text-brass hover:underline"
            >
              Praktische info &amp; kaart →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
