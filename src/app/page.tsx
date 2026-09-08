import Link from "next/link";
import { LiveCounter } from "@/components/LiveCounter";
import { HowItWorks } from "@/components/HowItWorks";
import { HomeStory } from "@/components/HomeStory";
import { DisclaimerStrip } from "@/components/DisclaimerStrip";
import { Reveal } from "@/components/Reveal";
import { ShareRow } from "@/components/ShareRow";
import { getPublicCampaignView } from "@/lib/campaign";
import { JsonLd } from "@/components/JsonLd";
import { displaySponsorCards } from "@/lib/ad-users";
import { LiveDrawSponsorBadge, HeadlineHomeRow, GoldHomeRow, SilverHomeRow, BronzeHomeRow } from "@/components/SponsorPlacements";
import { PageHero } from "@/components/PageHero";
import { groupSponsors, isExampleSponsor, sponsorSignupHref } from "@/lib/sponsors";
import { POINTS_EXPLAIN_SHORT, WINNERS_EXPLAIN } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueVisitorCount, onlineVisitorCount } from "@/lib/visitors";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const view = await getPublicCampaignView();
  const [visitors, onlineVisitors] = await Promise.all([uniqueVisitorCount(), onlineVisitorCount()]);
  const sponsors = await displaySponsorCards(view.campaign.id);
  const grouped = groupSponsors(sponsors);
  const realHeadlines = grouped.headline.filter((s) => !isExampleSponsor(s.name));
  const realHeadline = realHeadlines.find((s) => s.logo) || realHeadlines[0] || null;
  const participant = await getSessionUser("participant");
  const paidDonor = participant
    ? await prisma.payment.findFirst({
        where: { userId: participant.id, status: "paid", kind: "contribution" },
        select: { id: true },
      })
    : null;
  const shareCode = paidDonor && participant ? participant.referralCode : undefined;

  return (
    <>
      <JsonLd />
      <section className="relative w-full overflow-hidden pt-[4.75rem]">
        <div className="relative mb-[30px]">
          <img
            src="/5.png?v=20260908a"
            alt="Lamborghini Urus in champagne — sfeerbeeld van de droom, geen partnership"
            className="block h-auto w-full"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0" />
          <div className="absolute right-4 top-4 z-20 hidden text-right md:right-8 md:top-6 md:block">
            <p className="font-script text-3xl leading-snug [text-shadow:0_2px_16px_rgba(0,0,0,0.9),0_0_36px_rgba(0,0,0,0.7)] md:text-4xl">
              Samen naar
              <br />
              de droom
            </p>
            <p className="mt-3 font-display text-sm tracking-[0.18em] text-yellow [text-shadow:0_2px_12px_rgba(0,0,0,0.95),0_0_28px_rgba(0,0,0,0.8)] md:text-base">
              200.000 mensen × €2 = €400.000
            </p>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-start pl-4 pr-5 pb-24 pt-4 text-left md:pl-6 md:pb-24 md:pt-6">
            <h1 className="font-display font-bold text-[2.15rem] leading-[1.28] tracking-tight sm:text-5xl md:text-7xl">
              Kan <span className="text-yellow">€2</span> een
              <br />
              droom op wielen
              <br />
              waarmaken?
            </h1>
            <p className="mt-8 max-w-xl text-white/80">
              Geen goed doel.
              <br />
              Geen verzonnen verhaal.
              <br />
              Gewoon één grote droom en één kleine vraag.
            </p>
            <div className="mt-auto translate-y-[30px] pt-10">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/meedoen" className="btn-yellow">
                  Ik doe mee voor €2
                </Link>
                <Link href="/#how-it-works" className="btn-ghost">
                  Bekijk hoe het werkt
                </Link>
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.18em] text-white/60">
                Eenmalige bijdrage • geen abonnement • transparante teller
              </p>
            </div>
          </div>
          <div className="absolute -bottom-[30px] left-0 right-0 z-20">
            <DisclaimerStrip />
          </div>
        </div>
      </section>

      <LiveCounter
        showTitle={false}
        initial={{
          raisedCents: view.netCents,
          goalCents: view.campaign.goalCents,
          participantCount: view.totals.participantCount,
          targetContributions: view.campaign.targetContributions,
          remainingCents: view.remainingCents,
          remainingPeople: view.remainingPeople,
          percent: view.percent,
          contributionCents: view.totals.contributionCents,
          sponsorCents: view.totals.sponsorCents,
          sponsorCount: view.totals.sponsorCount,
          pixelCents: view.totals.pixelCents,
          pixelCount: view.totals.pixelCount,
          uniqueVisitors: visitors,
          onlineVisitors,
        }}
      />

      <section className="border-b border-white/10 bg-black pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="px-2 sm:px-2.5 md:px-3">
          <HeadlineHomeRow sponsor={realHeadline} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <div className="relative aspect-cinema w-full">
          <img
            src="/images/urus-villa.png?v=20260908a"
            alt="Urus in champagne op een donker terras bij schemer — sfeerbeeld"
            className="h-full w-full object-cover object-[78%_center] md:object-center"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-black/55 via-black/25 to-transparent md:w-1/2 md:from-black/45 md:via-black/15" />
          <div className="pointer-events-none absolute inset-0">
            <div className="flex h-full items-start pl-4 pt-[6%] md:pl-6 md:pt-[5%]">
              <p className="font-display font-bold text-[1.55rem] leading-[1.12] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
                <span className="mb-10 block whitespace-normal md:mb-16 md:whitespace-nowrap">
                  Als het doel gehaald wordt
                </span>
                <span className="block leading-[1.28]">
                  <span className="whitespace-normal md:whitespace-nowrap">
                    rijden <span className="text-yellow">4</span> gelukkigen
                  </span>
                  <br />
                  <span className="whitespace-normal md:whitespace-nowrap">een weekend</span>
                  <br />
                  <span className="whitespace-normal text-yellow md:whitespace-nowrap">met de Urus</span>
                </span>
              </p>
            </div>
          </div>
          <LiveDrawSponsorBadge sponsor={realHeadline} />
        </div>
      </section>

      <HomeStory />

      <section className="border-b border-white/10 bg-black pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="px-2 sm:px-2.5 md:px-3">
          <GoldHomeRow sponsors={grouped.gold} />
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 py-20">
        <img src="/images/urus-night.png?v=20260908a" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative mx-auto max-w-7xl px-5 text-center">
          <p className="font-script text-3xl">Samen naar de droom</p>
          <p className="mt-2 font-display text-[0.8rem] tracking-[0.3em] text-yellow">€2 × 200.000</p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl">Niet één persoon. Heel veel kleine bijdragen.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            Voor één persoon is €2 iets kleins. Voor mij betekent het iets groots.
            <br />
            Dat is het hele idee.
          </p>
          <Link href="/meedoen" className="btn-yellow mt-8">
            Ik doe mee voor €2
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black py-8 md:py-10">
        <div className="px-2 sm:px-2.5 md:px-3">
          <SilverHomeRow sponsors={grouped.silver} />
        </div>
      </section>

      <section className="relative overflow-hidden pt-10 pb-24 md:pt-12">
        <img src="/images/urus-hero.png?v=20260908a" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto max-w-7xl px-5 text-left">
          <div>
            <h2 className="text-left font-display text-4xl leading-[1.25] md:text-6xl md:leading-[1.25]">
              Ik help
              <br />
              de droom
              <br />
              mee waarmaken
            </h2>
            <p className="mt-4 text-left text-white/80">Eenmalig €2. Geen abonnement. Volledig te volgen.</p>
            <div className="mt-8 flex w-full flex-col items-start justify-start gap-3 sm:flex-row">
              <Link href="/meedoen" className="btn-yellow">
                Ik doe mee voor €2
              </Link>
              <Link href={sponsorSignupHref("gold")} className="btn-ghost">
                Ik wil sponsoren
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10 bg-black py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="min-w-0 max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl">Nodig anderen uit</h2>
            <p className="mt-2 font-display text-[0.7rem] tracking-[0.18em] text-yellow">
              {shareCode ? "Uw persoonlijke link — punten tellen mee" : "Campagne delen, nog zonder punten"}
            </p>
            <div className="mt-2">
              <ShareRow
                compact
                className="justify-start"
                referralCode={shareCode}
                copyLabel={shareCode ? "Kopieer mijn link" : "Kopieer campagne"}
              />
            </div>
            <p className="mt-3 text-sm leading-snug text-white/75 md:text-[0.95rem]">
              {shareCode
                ? "U hebt al gestort. WhatsApp, Facebook en e-mail sturen nu uw persoonlijke code mee. Wie via die link stort, levert u punten op."
                : "Nog niet gestort? Deze knoppen delen de campagne zonder punten. Na uw €2 sturen dezelfde knoppen automatisch uw persoonlijke code mee."}
              <br />
              Elke €2 = 5 punten én een extra lotnummer. U mag zo vaak storten als u wilt.
            </p>
          </div>
          <Link href="/dashboard" className="btn-ghost shrink-0 !px-3 !py-1.5 !text-xs">
            Bekijk uw punten →
          </Link>
        </div>
      </section>

      <HowItWorks />

      <section className="relative overflow-hidden bg-black pt-0 pb-20">
        <img
          src="/images/urus-terrace.png?v=20260908a"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
        <div className="relative mx-auto max-w-7xl px-5 pt-6 md:pt-8">
          <h2 className="font-display text-4xl">U kan gratis met de Urus rijden</h2>
          <p className="mt-4 font-display text-4xl">
            <span className="text-yellow">4 weekends</span>
            <br />
            <span className="text-yellow">2</span> via inspanning,
            <br />
            <span className="text-yellow">2</span> via het lot.
          </p>
          <p className="mt-4 max-w-3xl text-white/75">{WINNERS_EXPLAIN}</p>
          <p className="mt-3 max-w-3xl text-white/75">{POINTS_EXPLAIN_SHORT}</p>
          {view.prizePublic ? (
            <Link href="/winactie-voorwaarden" className="mt-4 inline-block text-sm uppercase tracking-widest text-yellow">
              Winactievoorwaarden →
            </Link>
          ) : null}
        </div>
      </section>

      <section className="bg-black pt-8 pb-16 md:pt-10 md:pb-24">
        <div className="px-2 sm:px-2.5 md:px-3">
          <BronzeHomeRow sponsors={grouped.bronze} />
        </div>
      </section>

      <PageHero
        heading="h2"
        embedded
        kicker="Zelfstandigen & kleine merken"
        title="De Pixelwall. Uw reclame, vak voor vak."
        image="/images/urus-night.png?v=20260908a"
        titleClassName="whitespace-nowrap text-[clamp(0.72rem,2.1vw+0.45rem,3.25rem)]"
        contentClassName="mt-8 max-w-5xl"
      >
        <p className="font-display text-[clamp(1.35rem,3.2vw,2.75rem)] leading-[1.15] tracking-tight text-white">
          Geen groot budget nodig.
        </p>
        <p className="mt-3 font-display text-[clamp(1.15rem,2.6vw,2.25rem)] leading-[1.2] tracking-tight text-white">
          Vanaf <span className="text-yellow">€10</span> koopt u een vak op de Pixelwall, met uw
          logo en link.
        </p>
        <Link href="/pixels" className="btn-yellow mt-8">
          Naar de Pixelwall
        </Link>
      </PageHero>
    </>
  );
}
