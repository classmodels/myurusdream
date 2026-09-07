import Link from "next/link";
import { prettyShareUrl } from "@/lib/share";
import { formatCents } from "@/lib/money";
import { ShareRow } from "@/components/ShareRow";
import { RepeatDonateButton } from "@/components/RepeatDonateButton";
import { POINTS_EXPLAIN_SHORT, WINNERS_EXPLAIN } from "@/lib/constants";
import { displayPersonName } from "@/lib/leaderboard";
import { RankingLive } from "@/app/dashboard/RankingLive";
import { Accordion } from "@/components/Accordion";
import type { getDashboardData } from "@/lib/dashboard-data";

type Data = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;

export function ParticipantDashboard({
  data,
  preview = false,
}: {
  data: Data;
  preview?: boolean;
}) {
  const { user, payments, pointRows, referred, view, totalPoints, rankingRows, ticketRows, myRank } =
    data;
  const latest = payments[0] || null;
  const myTickets = payments.length;
  const totalPaid = payments.reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28">
      {preview ? (
        <p className="mb-6 border border-yellow/40 bg-yellow/10 p-3 text-sm text-yellow">
          U bekijkt het dashboard van {user.firstName || user.email} zoals die persoon het ziet.
        </p>
      ) : null}
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Dashboard</p>
      <h1 className="mt-3 font-display text-5xl">Hallo {user.firstName || "deelnemer"}</h1>
      {!preview ? (
        <>
          <p className="mt-3 max-w-2xl text-white/75">
            U blijft ingelogd. Nog eens €2 storten kan met één knop. Klik bovenaan op
            “Zet meldingen aan” op de pagina Meldingen. Op iPhone: open het icoon op het
            beginscherm, ga naar Meldingen, tik op de gele knop.
          </p>
          <div className="mt-6">
            <RepeatDonateButton />
          </div>
        </>
      ) : (
        <p className="mt-3 text-white/70">
          {user.email} · {user.phone || "geen gsm"}
        </p>
      )}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Stortingen" value={String(myTickets)} />
        <Card label="Totaal gestort" value={formatCents(totalPaid)} />
        <Card
          label="Laatste storting"
          value={latest?.paidAt?.toLocaleDateString("nl-BE") || "—"}
        />
        <Card
          label="Campagne"
          value={`${formatCents(view.totals.raisedCents)} / ${formatCents(view.campaign.goalCents)}`}
        />
        <Card label="Uw punten" value={String(totalPoints)} />
        <Card label="Uw plaats" value={myRank ? `#${myRank}` : "—"} />
      </div>

      <div className="mt-12 card-dark p-6">
        <h2 className="font-display text-3xl">Hoe de punten werken</h2>
        <p className="mt-3 text-white/75">{POINTS_EXPLAIN_SHORT}</p>
        <p className="mt-3 text-white/75">{WINNERS_EXPLAIN}</p>
        <ul className="mt-4 space-y-2 text-white/80">
          <li>Elke eigen €2 = 5 punten, bijgeteld op uw totaal.</li>
          <li>Elke eigen €2 = een nieuw lotnummer in de lotinglijst.</li>
          <li>Iemand stort via uw link = +2 voor u. Stort die persoon opnieuw = opnieuw +2.</li>
          <li>Verdere stortingen in uw lijn = +1. WhatsApp, Facebook en e-mail vanaf deze site sturen uw code mee.</li>
        </ul>
      </div>

      <div className="mt-12 card-dark p-6">
        <h2 className="font-display text-3xl">Uw persoonlijke link</h2>
        <p className="mt-2 text-white/70">
          Deel via WhatsApp, Facebook of e-mail. Uw code zit in de link, zodat u punten krijgt als
          zij storten.
        </p>
        <p className="mt-4 text-lg lowercase text-yellow">{prettyShareUrl(user.referralCode)}</p>
        {!preview ? (
          <div className="mt-5">
            <ShareRow
              referralCode={user.referralCode}
              copyLabel="Kopieer mijn link"
              className="justify-start"
            />
          </div>
        ) : null}
      </div>

      <RankingLive initialRanking={rankingRows} initialTickets={ticketRows} />

      {pointRows.length ? (
        <Accordion title="Uw puntenhistoriek">
          <div className="divide-y divide-white/10">
            {pointRows.map((row) => (
              <div key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3">
                <div>
                  <p>{row.reason}</p>
                  <p className="text-sm text-white/45">
                    {row.createdAt.toLocaleDateString("nl-BE")}
                  </p>
                </div>
                <p className="font-display text-xl text-yellow">+{row.amount}</p>
              </div>
            ))}
          </div>
        </Accordion>
      ) : null}

      {referred.length ? (
        <Accordion title="Mensen via uw link">
          <ul className="divide-y divide-white/10">
            {referred.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 px-5 py-3">
                <span>
                  {displayPersonName(r.referredUser.firstName || "", r.referredUser.lastName || "") ||
                    `Deelnemer #${r.referredUser.participantNumber}`}
                </span>
                <span className="text-yellow">+{r.pointsAwarded} voor u</span>
              </li>
            ))}
          </ul>
        </Accordion>
      ) : null}

      <p className="mt-8 flex flex-wrap gap-4">
        {preview ? (
          <Link href="/admin" className="text-sm uppercase tracking-widest text-yellow">
            Terug naar admin
          </Link>
        ) : (
          <>
            <Link href="/" className="text-sm uppercase tracking-widest text-yellow">
              Home
            </Link>
            <Link href="/volg-alles" className="text-sm uppercase tracking-widest text-yellow">
              Volg alles
            </Link>
            <a href="/api/auth/logout" className="text-sm uppercase tracking-widest text-muted hover:text-yellow">
              Uitloggen
            </a>
          </>
        )}
      </p>
      {!preview ? (
        <p className="mt-6 text-sm text-muted">
          Privacy: u kunt inzage vragen via contact. Nieuwsbrief is nooit verplicht.
        </p>
      ) : null}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </div>
  );
}
