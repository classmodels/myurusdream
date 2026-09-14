import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";

/** Geen database: altijd renderbaar onder SiteButler /portaal/myurusdream */
export async function HostedSafeHome() {
  const dict = await getDictionary();
  const h = dict.home;

  return (
    <>
      <section className="relative w-full overflow-hidden pt-[4.75rem]">
        <div className="relative mb-[30px] min-h-[36rem] sm:min-h-[40rem] md:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/5.png?v=20260908a"
            alt={h.heroAlt}
            className="block h-[36rem] w-full object-cover object-[70%_center] sm:h-[40rem] md:h-auto md:object-center"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0" />
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-start overflow-hidden pl-4 pr-5 pb-28 pt-4 text-left md:pl-6 md:pb-24 md:pt-6">
            <h1 className="font-display font-bold text-[1.85rem] leading-[1.25] tracking-tight sm:text-[2.15rem] md:text-7xl">
              {h.heroTitle1} <span className="text-yellow">€2</span>
              {h.heroTitle2 ? <> {h.heroTitle2}</> : null}
              <br />
              {h.heroTitle3}
              <br />
              {h.heroTitle4}
            </h1>
            <p className="mt-4 max-w-xl text-white/80 sm:mt-8">
              {h.heroLead1}
              <br />
              {h.heroLead2}
              <br />
              {h.heroLead3}
            </p>
            <div className="mt-auto translate-y-[30px] pt-6 sm:pt-10">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/meedoen" className="btn-yellow">
                  {h.ctaPrimary}
                </Link>
                <Link href="/#how-it-works" className="btn-ghost">
                  {h.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/urus-villa.png?v=20260908a"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-5">
          <p className="font-display text-3xl text-yellow md:text-5xl">{SITE_LABEL}</p>
          <p className="mt-4 max-w-2xl text-white/80">
            Preview in het SiteButler-portaal. Live cijfers en betalingen volgen zodra de database op Combell gekoppeld is.
          </p>
        </div>
      </section>
    </>
  );
}

const SITE_LABEL = "myurusdream.be";
