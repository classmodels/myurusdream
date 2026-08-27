import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPublicCampaignView } from "@/lib/campaign";
import { shareLinks } from "@/lib/share";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser("participant");
  if (!user) redirect("/inloggen");

  const payment = await prisma.payment.findFirst({
    where: { userId: user.id, status: "paid" },
    orderBy: { paidAt: "desc" },
  });
  const points = await prisma.pointsTransaction.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });
  const referrals = await prisma.referral.count({
    where: { referrerId: user.id, verifiedPayment: true },
  });
  const view = await getPublicCampaignView();
  const links = shareLinks(user.referralCode);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-28">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Dashboard</p>
      <h1 className="mt-3 font-display text-5xl">Hallo {user.firstName || "deelnemer"}</h1>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Deelnemersnummer" value={`#${user.participantNumber}`} />
        <Card
          label="Bijdrage"
          value={payment ? formatCents(payment.amountCents) : "Nog niet bevestigd"}
        />
        <Card
          label="Datum"
          value={payment?.paidAt?.toLocaleDateString("nl-BE") || "—"}
        />
        <Card
          label="Campagne"
          value={`${formatCents(view.totals.raisedCents)} / ${formatCents(view.campaign.goalCents)}`}
        />
        {view.referralPublic ? (
          <>
            <Card label="Punten" value={String(points._sum.amount ?? 0)} />
            <Card label="Succesvolle verwijzingen" value={String(referrals)} />
          </>
        ) : (
          <Card label="Punten & referrals" value="Niet publiek actief" />
        )}
      </div>

      <div className="mt-12 card-dark p-6">
        <h2 className="font-display text-3xl">Deel de campagne</h2>
        <p className="mt-2 text-sm text-muted break-all">{links.url}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a className="btn-yellow" href={links.whatsapp} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a className="btn-ghost" href={links.facebook} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a className="btn-ghost" href={links.email}>
            E-mail
          </a>
        </div>
      </div>

      <p className="mt-8">
        <a href="/api/auth/logout" className="text-sm uppercase tracking-widest text-muted hover:text-yellow">
          Uitloggen
        </a>
      </p>
      <p className="mt-6 text-sm text-muted">
        Privacy: u kunt inzage vragen via contact. Nieuwsbrief is nooit verplicht.
      </p>
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
