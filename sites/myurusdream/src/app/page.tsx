import { HostedSafeHome } from "@/components/HostedSafeHome";
import { getPublicCampaignView } from "@/lib/campaign";
import { LiveCounter } from "@/components/LiveCounter";
import { HowItWorks } from "@/components/HowItWorks";
import { HomeStory } from "@/components/HomeStory";
import { DisclaimerStrip } from "@/components/DisclaimerStrip";
import { ShareButtons } from "@/components/ShareButtons";
import { JsonLd } from "@/components/JsonLd";
import { displaySponsorCards } from "@/lib/ad-users";
import { LiveDrawSponsorBadge, HeadlineHomeRow, GoldHomeRow, SilverHomeRow, BronzeHomeRow } from "@/components/SponsorPlacements";
import { PageHero } from "@/components/PageHero";
import { groupSponsors, isExampleSponsor, sponsorSignupHref } from "@/lib/sponsors";
import { uniqueVisitorCount, onlineVisitorCount } from "@/lib/visitors";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { withBasePath } from "@/lib/base-path";
import Link from "next/link";

export const dynamic = "force-dynamic";

/** Onder SiteButler altijd de veilige homepage (geen DB-crash → geen witte 500 in de popup). */
const hostedUnderSiteButler = Boolean(
  (process.env.NEXT_PUBLIC_BASE_PATH || process.env.SITEBUTLER_BASE_PATH || "").trim(),
);

export default async function HomePage() {
  if (hostedUnderSiteButler) {
    return <HostedSafeHome />;
  }

  try {
    return await FullHome();
  } catch (error) {
    console.error("Homepage kon niet volledig laden.", error);
    return <HostedSafeHome />;
  }
}

async function FullHome() {
  const dict = await getDictionary();
  const h = dict.home;
  const view = await getPublicCampaignView();
  const [visitors, onlineVisitors] = await Promise.all([uniqueVisitorCount(), onlineVisitorCount()]);
  const sponsors = await displaySponsorCards(view.campaign.id).catch(() => []);
  const grouped = groupSponsors(sponsors);
  const realHeadlines = grouped.headline.filter((s) => !isExampleSponsor(s.name));
  const realHeadline = realHeadlines.find((s) => s.logo) || realHeadlines[0] || null;

  return (
    <>
      <JsonLd />
      <section className="relative w-full overflow-hidden pt-[4.75rem]">
        <div className="relative mb-[30px] min-h-[36rem] sm:min-h-[40rem] md:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/5.png?v=20260908a")}
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
          deductFees: view.deductFees,
        }}
      />

      <section className="border-b border-white/10 bg-black pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="mx-auto max-w-7xl px-5">
          <HeadlineHomeRow sponsor={realHeadline} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <div className="relative aspect-cinema w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBasePath("/images/urus-villa.png?v=20260908a")}
            alt={h.villaAlt}
            className="h-full w-full object-cover object-[78%_center] md:object-center"
          />
          <LiveDrawSponsorBadge sponsor={realHeadline} />
        </div>
      </section>

      <HomeStory />

      <section className="border-b border-white/10 bg-black pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="mx-auto max-w-7xl px-5">
          <GoldHomeRow sponsors={grouped.gold} />
        </div>
      </section>

      <HowItWorks />

      <section className="border-b border-white/10 bg-black py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-5">
          <SilverHomeRow sponsors={grouped.silver} />
        </div>
      </section>

      <section className="bg-black pt-8 pb-16 md:pt-10 md:pb-24">
        <div className="mx-auto max-w-7xl px-5">
          <BronzeHomeRow sponsors={grouped.bronze} />
        </div>
      </section>

      <PageHero
        heading="h2"
        embedded
        kicker={h.pixelKicker}
        title={h.pixelTitle}
        image="/images/urus-night.png?v=20260908a"
        titleClassName="whitespace-nowrap text-[clamp(0.72rem,2.1vw+0.45rem,3.25rem)]"
        contentClassName="mt-8 max-w-5xl"
      >
        <p className="font-display text-[clamp(1.35rem,3.2vw,2.75rem)] leading-[1.15] tracking-tight text-white">
          {h.pixelBudget}
        </p>
        <ShareButtons
          compact
          className="mt-6"
          shareText={dict.share.text}
          shareSubject={dict.share.subject}
          copyLabel={dict.share.copy}
        />
        <Link href="/pixels" className="btn-yellow mt-8">
          {h.pixelCta}
        </Link>
      </PageHero>
    </>
  );
}
