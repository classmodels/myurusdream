import Link from "next/link";
import { LiveCounter } from "@/components/LiveCounter";
import { HowItWorks } from "@/components/HowItWorks";
import { DisclaimerStrip } from "@/components/DisclaimerStrip";
import { Reveal } from "@/components/Reveal";
import { ActivityFeed } from "@/components/ActivityFeed";
import { LegalStamp } from "@/components/LegalStamp";
import { getPublicCampaignView, parseMoneyBreakdown, resolveBreakdown } from "@/lib/campaign";
import { formatCents } from "@/lib/money";
import { NOT_CHARITY_LINES, TAGLINE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const view = await getPublicCampaignView();
  const faqs = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });
  const updates = await prisma.campaignUpdate.findMany({
    where: { campaignId: view.campaign.id, published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const breakdown = resolveBreakdown(
    parseMoneyBreakdown(view.campaign.moneyBreakdownJson),
    view.totals.raisedCents,
  );
  const story = view.campaign.storyText.split("\n").filter(Boolean);

  return (
    <>
      <JsonLd />
      <section className="relative min-h-[100svh] overflow-hidden">
        <img
          src="/images/hero.png"
          alt="Gele Urus — een kleine bijdrage, een grote droom"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
          <p className="font-display text-sm tracking-[0.35em] text-yellow">DroomOp2</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] italic md:text-7xl">
            {TAGLINE}
          </h1>
          <p className="mt-6 font-display text-2xl text-yellow md:text-4xl">
            200.000 mensen × €2 = €400.000
          </p>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            Geen goed doel. Geen verzonnen verhaal. Gewoon één grote droom en één kleine vraag.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/meedoen" className="btn-yellow">
              Ik doe mee voor €2
            </Link>
            <Link href="/#hoe" className="btn-ghost">
              Bekijk hoe het werkt
            </Link>
          </div>
          <p className="mt-5 text-sm uppercase tracking-[0.18em] text-white/55">
            Eenmalige bijdrage • geen abonnement • transparante teller
          </p>
        </div>
      </section>

      <DisclaimerStrip />

      <LiveCounter
        initial={{
          raisedCents: view.totals.raisedCents,
          goalCents: view.campaign.goalCents,
          participantCount: view.totals.participantCount,
          targetContributions: view.campaign.targetContributions,
          remainingCents: view.remainingCents,
          remainingPeople: view.remainingPeople,
          percent: view.percent,
        }}
      />

      <section id="verhaal" className="bg-black py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm tracking-[0.3em] text-yellow">Waarom deze campagne?</p>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">Waarom doe ik dit?</h2>
          </Reveal>
          <Reveal>
            <div className="space-y-5 text-lg leading-relaxed text-white/80">
              {story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-surface py-20">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <p className="font-display text-sm tracking-[0.3em] text-yellow">€2 × 200.000</p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl">Niet één persoon. Heel veel kleine bijdragen.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-white/70">
            Voor één persoon is €2 klein. Tweehonderdduizend keer €2 kan een brutodoel van{" "}
            {formatCents(view.campaign.goalCents)} halen. Dat is het hele idee.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl md:text-6xl">Geen goed doel — gewoon eerlijk</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {NOT_CHARITY_LINES.map((line) => (
              <div key={line} className="border border-yellow/40 bg-surface p-6 font-display text-2xl text-yellow">
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks prizePublic={view.prizePublic} referralPublic={view.referralPublic} />

      <section id="transparantie" className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl md:text-6xl">Geen kleine lettertjes</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "€2", d: "Eenmalige bijdrage." },
              { t: "Geen abonnement", d: "Er wordt nooit automatisch opnieuw geïnd." },
              { t: "Live teller", d: "Aantal bijdragen en totaalbedrag zijn zichtbaar." },
              { t: "Duidelijke voorwaarden", d: "Voor betaling ziet u exact waarvoor u betaalt." },
            ].map((c) => (
              <div key={c.t} className="card-dark p-6">
                <p className="font-display text-3xl text-yellow">{c.t}</p>
                <p className="mt-3 text-white/70">{c.d}</p>
              </div>
            ))}
          </div>
          <Link href="/voorwaarden" className="mt-6 inline-block text-sm uppercase tracking-widest text-yellow">
            Bekijk volledige voorwaarden →
          </Link>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl md:text-6xl">Waar gaat het geld naartoe?</h2>
          <p className="mt-4 max-w-2xl text-white/70">
            €400.000 is het brutodoel, niet automatisch de aankoopprijs van de wagen. Kosten
            worden hier zichtbaar gehouden.
          </p>
          <div className="mt-8 divide-y divide-white/10 border border-white/10">
            {breakdown.map((line) => (
              <div key={line.key} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
                <div>
                  <p>{line.label}</p>
                  {line.note ? <p className="text-sm text-muted">{line.note}</p> : null}
                </div>
                <p className="font-display text-2xl text-yellow">{formatCents(line.cents)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl">Eventuele winactie</h2>
          {view.prizePublic ? (
            <p className="mt-4 max-w-2xl text-white/75">
              Week 1 via loting, week 2 eventueel via inspanning — onder de gebruiksvoorwaarden.
            </p>
          ) : (
            <div className="mt-4 max-w-2xl space-y-3 text-white/70">
              <p>
                Een eventuele week rijden is technisch voorbereid maar niet publiek actief
                (`PRIZE_FEATURE_ENABLED = false`).
              </p>
              <LegalStamp />
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl">Eventueel referralprogramma</h2>
          {view.referralPublic ? (
            <p className="mt-4 text-white/75">Deel uw persoonlijke link en volg punten in uw dashboard.</p>
          ) : (
            <div className="mt-4 max-w-2xl space-y-3 text-white/70">
              <p>
                Uitnodigen en punten zijn gebouwd, maar publiek uitgeschakeld
                (`DISABLED_PENDING_LEGAL_APPROVAL = true`). Multi-level beloningen staan uit.
              </p>
              <LegalStamp />
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-white/10 bg-black py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl md:text-6xl">Live deelnemers</h2>
          <p className="mt-4 font-display text-5xl text-yellow">
            {view.totals.participantCount.toLocaleString("nl-BE")}
            <span className="text-white/30"> / {view.campaign.targetContributions.toLocaleString("nl-BE")}</span>
          </p>
          <div className="mt-10">
            <ActivityFeed />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-4xl">Updates</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {updates.map((u) => (
              <article key={u.id} className="card-dark p-6">
                <p className="text-xs uppercase tracking-widest text-muted">
                  {u.createdAt.toLocaleDateString("nl-BE")}
                </p>
                <h3 className="mt-2 font-display text-2xl">{u.title}</h3>
                <p className="mt-3 text-white/70">{u.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">FAQ</h2>
            <Link href="/faq" className="text-sm uppercase tracking-widest text-yellow">
              Alle vragen →
            </Link>
          </div>
          <div className="mt-8 divide-y divide-white/10">
            {faqs.map((f) => (
              <details key={f.id} className="group py-4">
                <summary className="cursor-pointer font-display text-xl">{f.question}</summary>
                <p className="mt-3 max-w-3xl text-white/70">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <img src="/images/og.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <h2 className="font-display text-4xl md:text-6xl">Ik help de droom mee waarmaken</h2>
          <p className="mt-4 text-white/75">Eenmalig €2. Geen abonnement. Volledig te volgen.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/meedoen" className="btn-yellow">
              Doe mee voor €2
            </Link>
            <Link href="/volg-alles" className="btn-ghost">
              Bekijk de live teller
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
