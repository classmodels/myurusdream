import Link from "next/link";
import { LiveCounter } from "@/components/LiveCounter";
import { HowItWorks } from "@/components/HowItWorks";
import { HomeStory } from "@/components/HomeStory";
import { DisclaimerStrip } from "@/components/DisclaimerStrip";
import { ShareRow } from "@/components/ShareRow";
import { getPublicCampaignView } from "@/lib/campaign";
import { JsonLd } from "@/components/JsonLd";
import { displaySponsorCards } from "@/lib/ad-users";
import { LiveDrawSponsorBadge, HeadlineHomeRow, GoldHomeRow, SilverHomeRow, BronzeHomeRow } from "@/components/SponsorPlacements";
import { PageHero } from "@/components/PageHero";
import { groupSponsors, isExampleSponsor, sponsorSignupHref } from "@/lib/sponsors";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uniqueVisitorCount, onlineVisitorCount } from "@/lib/visitors";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dict = await getDictionary();
  const h = dict.home;
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
            alt={h.heroAlt}
            className="block h-auto w-full"
          />
          <div className="hero-scrim pointer-events-none absolute inset-0" />
          <div className="absolute right-4 top-4 z-20 hidden text-right md:right-8 md:top-6 md:block">
            <p className="font-script text-3xl leading-snug [text-shadow:0_2px_16px_rgba(0,0,0,0.9),0_0_36px_rgba(0,0,0,0.7)] md:text-4xl">
              {h.samenLine1}
              <br />
              {h.samenLine2}
            </p>
            <p className="mt-3 font-display text-sm tracking-[0.18em] text-yellow [text-shadow:0_2px_12px_rgba(0,0,0,0.95),0_0_28px_rgba(0,0,0,0.8)] md:text-base">
              {h.goalLine}
            </p>
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-start justify-start pl-4 pr-5 pb-24 pt-4 text-left md:pl-6 md:pb-24 md:pt-6">
            <h1 className="font-display font-bold text-[2.15rem] leading-[1.28] tracking-tight sm:text-5xl md:text-7xl">
              {h.heroTitle1} <span className="text-yellow">€2</span>
              {h.heroTitle2 ? <> {h.heroTitle2}</> : null}
              <br />
              {h.heroTitle3}
              <br />
              {h.heroTitle4}
            </h1>
            <p className="mt-8 max-w-xl text-white/80">
              {h.heroLead1}
              <br />
              {h.heroLead2}
              <br />
              {h.heroLead3}
            </p>
            <div className="mt-auto translate-y-[30px] pt-10">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/meedoen" className="btn-yellow">
                  {h.ctaPrimary}
                </Link>
                <Link href="/#how-it-works" className="btn-ghost">
                  {h.ctaSecondary}
                </Link>
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.18em] text-white/60">{h.fineprint}</p>
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
        <div className="mx-auto max-w-7xl px-5">
          <HeadlineHomeRow sponsor={realHeadline} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <div className="relative aspect-cinema w-full">
          <img
            src="/images/urus-villa.png?v=20260908a"
            alt={h.villaAlt}
            className="h-full w-full object-cover object-[78%_center] md:object-center"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[70%] bg-gradient-to-r from-black/55 via-black/25 to-transparent md:w-1/2 md:from-black/45 md:via-black/15" />
          <div className="pointer-events-none absolute inset-0">
            <div className="flex h-full items-start pl-4 pt-[6%] md:pl-6 md:pt-[5%]">
              <p className="font-display font-bold text-[1.55rem] leading-[1.12] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
                <span className="mb-10 block whitespace-normal md:mb-16 md:whitespace-nowrap">
                  {h.asGoalReached}
                </span>
                <span className="block leading-[1.28]">
                  <span className="whitespace-normal md:whitespace-nowrap">{h.ride4}</span>
                  <br />
                  <span className="whitespace-normal md:whitespace-nowrap">{h.weekend}</span>
                  <br />
                  <span className="whitespace-normal text-yellow md:whitespace-nowrap">{h.withUrus}</span>
                </span>
              </p>
            </div>
          </div>
          <LiveDrawSponsorBadge sponsor={realHeadline} />
        </div>
      </section>

      <HomeStory />

      <section className="border-b border-white/10 bg-black pt-4 pb-8 md:pt-6 md:pb-10">
        <div className="mx-auto max-w-7xl px-5">
          <GoldHomeRow sponsors={grouped.gold} />
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 py-20">
        <img src="/images/urus-night.png?v=20260908a" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative mx-auto max-w-7xl px-5 text-center">
          <p className="font-script text-3xl">{h.whyKicker}</p>
          <p className="mt-2 font-display text-[0.8rem] tracking-[0.3em] text-yellow">{h.togetherScript}</p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl">{h.whyTitle}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/80">
            {h.togetherBody1}
            <br />
            {h.togetherBody2}
          </p>
          <Link href="/meedoen" className="btn-yellow mt-8">
            {h.ctaPrimary}
          </Link>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-5">
          <SilverHomeRow sponsors={grouped.silver} />
        </div>
      </section>

      <section className="relative z-10 overflow-hidden pt-10 pb-28 md:min-h-[28rem] md:pt-12 md:pb-10">
        <img src="/images/urus-hero.png?v=20260908a" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-7xl flex-col justify-between gap-10 px-5 md:min-h-[28rem]">
          <div className="text-left">
            <h2 className="text-left font-display text-4xl leading-[1.25] md:text-6xl md:leading-[1.25]">
              {h.helpTitle1}
              <br />
              {h.helpTitle2}
              <br />
              {h.helpTitle3}
            </h2>
            <p className="mt-4 text-left text-white/80">{h.togetherTitle}</p>
            <div className="mt-8 flex w-full flex-col items-start justify-start gap-3 sm:flex-row">
              <Link href="/meedoen" className="btn-yellow">
                {h.ctaPrimary}
              </Link>
              <Link href={sponsorSignupHref("gold")} className="btn-ghost">
                {h.sponsorCta}
              </Link>
            </div>
          </div>
          <div className="ml-auto w-full max-w-3xl text-right md:pb-2">
            <h2 className="font-display text-2xl md:text-3xl">{h.inviteTitle}</h2>
            <p className="mt-2 font-display text-[0.7rem] tracking-[0.18em] text-yellow">
              {shareCode ? h.inviteSubPaid : h.inviteSub}
            </p>
            <div className="mt-2">
              <ShareRow
                compact
                className="justify-end"
                referralCode={shareCode}
                copyLabel={shareCode ? dict.share.copyMine : dict.share.copy}
              />
            </div>
            <p className="mt-3 text-sm leading-snug text-white/75 md:text-[0.95rem]">
              {shareCode ? (
                h.inviteBodyPaid
              ) : (
                <>
                  {h.inviteBodyGuest1}
                  <br />
                  {h.inviteBodyGuest2}
                </>
              )}
              <br />
              {h.inviteExtra}
            </p>
            <Link href="/dashboard" className="btn-ghost mt-4 inline-flex !px-3 !py-1.5 !text-xs">
              {h.pointsLink}
            </Link>
          </div>
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
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl lg:text-4xl">
            {h.viralTitle}
          </h2>
          <div className="mt-4 max-w-5xl space-y-1 md:space-y-1.5">
            <div className="-mt-2 mb-5 font-display text-[clamp(0.85rem,1.55vw,1.35rem)] font-bold uppercase leading-[1.15] tracking-tight text-yellow md:mb-6">
              {h.viralLine1} {h.viralLine2}
            </div>
            <div className="font-display text-[clamp(0.85rem,1.55vw,1.35rem)] font-bold uppercase leading-[1.15] tracking-tight text-white">
              {h.viralLine3}
            </div>
            <div className="font-display text-[clamp(0.85rem,1.55vw,1.35rem)] font-bold uppercase leading-[1.15] tracking-tight text-white">
              {h.viralLine4}
            </div>
            <div className="font-display text-[clamp(0.85rem,1.55vw,1.35rem)] font-bold uppercase leading-[1.15] tracking-tight text-yellow">
              {h.viralLine5}
            </div>
          </div>
          <p className="mt-8 max-w-3xl text-sm text-white/75 md:text-base">{dict.noPrizeExplain}</p>
          <p className="mt-3 max-w-3xl text-sm text-white/75 md:text-base">{dict.shareExplain}</p>
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
        <p className="mt-3 font-display text-[clamp(1.15rem,2.6vw,2.25rem)] leading-[1.2] tracking-tight text-white">
          {h.pixelBody}
        </p>
        <Link href="/pixels" className="btn-yellow mt-8">
          {h.pixelCta}
        </Link>
      </PageHero>
    </>
  );
}
