import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { LiveDrawBanner } from "@/components/LiveDrawBanner";
import { SPONSOR_TIERS, parseSponsorTierParam, sponsorSignupHref } from "@/lib/sponsors";
import { LIVE_DRAW } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sponsors",
  description:
    "Bedrijven en merken die meesponsoren krijgen een plek op de site — groter naarmate het bedrag groter is. Zichtbaarheid voor de campagne, zonder winactie of loting gekoppeld aan €2-bijdragen.",
};

export default async function SponsorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  if (tier) redirect(sponsorSignupHref(parseSponsorTierParam(tier)));

  return (
    <div className="pb-24">
      <PageHero
        kicker="Merken & bedrijven"
        title={
          <>
            Zet uw naam
            <br />
            op het moment dat
            <br />
            heel de Benelux
            <br />
            meekijkt
          </>
        }
        titleClassName="max-w-4xl text-4xl font-bold leading-[0.95] tracking-tight md:text-6xl"
        image="/images/urus-villa.png"
        overlay={
          <div id="pixels" className="max-w-[17rem] text-right sm:max-w-xs">
            <p className="font-display text-[0.65rem] tracking-[0.28em] text-yellow">Pixelwall</p>
            <h2 className="mt-1.5 font-display text-lg font-bold leading-tight md:text-xl">
              Geen groot budget?
              <br />
              Zet uw reclame
              <br />
              Pixelwall
            </h2>
            <p className="mt-2 text-[0.7rem] leading-snug text-white/75">
              Bakker, kapper, garage, café: u koopt vakken op de Pixelwall met uw logo en link.
              Vanaf €10. Hoe meer vakken, hoe groter uw reclame.
            </p>
            <Link href="/pixels" className="btn-yellow mt-3 !px-3 !py-1.5 !text-[0.6rem]">
              Naar de Pixelwall
            </Link>
          </div>
        }
      >
        <p>
          Grote merken, KMO’s, lokale helden: u helpt het doel van €400.000 halen.
          <br />
          En krijgt daar een plek voor terug.
        </p>
        <Link href={sponsorSignupHref("gold")} className="btn-yellow mt-8">
          Word sponsor
        </Link>
      </PageHero>

      <section className="mx-auto max-w-7xl border-t border-yellow/30 px-5 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <p className="w-full bg-yellow px-2.5 py-1 font-display text-[0.95rem] tracking-[0.22em] text-black">
              Waarom meedoen
            </p>
            <h2 className="font-display text-4xl md:text-5xl">Dit is geen banner. Dit is een verhaal waar mensen voor terugkomen.</h2>
            <p className="text-white/80">
              Tweehonderdduizend mensen die elk €2 storten. Plus elk bedrijf dat durft in te
              stappen. Als dat doel er is, vieren we het moment{" "}
              <strong className="text-yellow">live</strong>, op {LIVE_DRAW.dateLabel}, op een
              spectaculaire plek. Gestreamd. Voor iedereen die meedeed. Geen trekking van
              winnaars — wel merkzichtbaarheid voor de campagne.
            </p>
            <p className="text-white/80">
              Dat is het moment waarop uw logo geen bijzaak meer is. Iedereen die heeft
              bijgedragen, kijkt.
              <br />
              De camera’s staan aan.
              <br />
              En uw merk staat daar — in beeld, op de site, in de herinnering van die avond.
            </p>
            <p className="text-white/80">
              Klein budget? Er is een plek. Groot budget? U krijgt de beste. Eerlijk, zichtbaar,
              en het telt 1-op-1 mee voor het doel.
            </p>
            <LiveDrawBanner compact />
          </div>
          <div className="space-y-4 border border-yellow/35 bg-surface p-6 md:p-8">
            <p className="font-display text-3xl text-yellow">Uw plek, naar uw bedrag</p>
            <ul className="space-y-4">
              {SPONSOR_TIERS.map((t) => (
                <li key={t.id} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <p className="font-display text-xl">
                    {t.name}{" "}
                    <span className="text-yellow">{t.priceLabel}</span>
                  </p>
                  <p className="mt-1 text-white/70">{t.placement}</p>
                  <ul className="mt-2 space-y-1 text-white/60">
                    {t.perks.map((p) => (
                      <li key={p}>— {p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="text-white/50">
              U mag altijd méér storten dan het minimum van een schaal. Het hoogste bedrag
              krijgt de hoogste plaats. Lamborghini is geen partner van deze campagne.
            </p>
            <Link href={sponsorSignupHref("gold")} className="btn-yellow mt-2">
              Word sponsor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
