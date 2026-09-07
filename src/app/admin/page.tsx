import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getCampaign, getLiveTotals } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import {
  canSwitchLive,
  parseChecklist,
  DISABLED_PENDING_LEGAL_APPROVAL,
  PRIZE_FEATURE_ENABLED,
  MULTI_LEVEL_REFERRALS,
} from "@/lib/flags";
import { CHECKLIST_LABELS, GOAL_FAILURE_OPTIONS, type ChecklistKey } from "@/lib/constants";
import {
  setGoalFailure,
  togglePaymentsPaused,
  toggleReferralAdmin,
  togglePrizeAdmin,
  saveChecklist,
  tryGoLive,
  saveMoneyBreakdown,
  saveOrganizer,
  savePointsConfig,
  createUpdate,
  saveFaq,
  blockUser,
  reviewFraud,
  lockAndDraw,
  saveMollie,
  sendBroadcast,
  saveShareCopy,
} from "./actions";
import { getMollieApiKey, getMollieWebhookUrl, isMollieKey } from "@/lib/mollie";
import { maskSecret } from "@/lib/secret-box";
import { uniqueVisitorCount } from "@/lib/visitors";
import { getShareCopy } from "@/lib/share";
import { SHARE_TEXT, SITE_NAME } from "@/lib/constants";
import { hideComment } from "@/app/discussie/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getSessionUser("admin");
  if (!admin) redirect("/admin/login");

  const campaign = await getCampaign();
  const totals = await getLiveTotals(campaign.id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [todayCount, weekCount, failed, refunds, referrals, fraudOpen, users, payments, faqs, flags, draws, visitors, mollieKey, webhookUrl, shareCopy, comments] =
    await Promise.all([
      prisma.payment.count({ where: { campaignId: campaign.id, status: "paid", paidAt: { gte: today } } }),
      prisma.payment.count({ where: { campaignId: campaign.id, status: "paid", paidAt: { gte: week } } }),
      prisma.payment.count({ where: { campaignId: campaign.id, status: { in: ["failed", "expired", "canceled"] } } }),
      prisma.refund.count(),
      prisma.referral.count({ where: { verifiedPayment: true } }),
      prisma.fraudFlag.count({ where: { status: "open" } }),
      prisma.user.findMany({
        where: { role: "participant" },
        orderBy: { createdAt: "desc" },
        include: {
          payments: {
            where: { status: "paid" },
            select: { kind: true, amountCents: true, status: true, paidAt: true },
          },
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { user: true },
      }),
      prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.fraudFlag.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.draw.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      uniqueVisitorCount(),
      getMollieApiKey(),
      getMollieWebhookUrl(),
      getShareCopy(),
      prisma.discussionPost.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    ]);

  const checklist = parseChecklist(campaign.checklistJson);
  const liveReady = canSwitchLive(campaign);
  const euro2Count = users.reduce(
    (n, u) => n + u.payments.filter((p) => p.kind === "contribution").length,
    0,
  );
  const accountCount = users.length;

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-5 pb-24 pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm tracking-[0.3em] text-yellow">Admin</p>
          <h1 className="mt-2 font-display text-5xl">Campagne</h1>
        </div>
        <a href="/api/admin/logout" className="btn-ghost text-sm">
          Uitloggen
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Ontvangen" value={formatCents(totals.raisedCents)} />
        <Kpi label="Deelnemers" value={String(totals.participantCount)} />
        <Kpi label="Bezoekers" value={String(visitors)} />
        <Kpi label="€2 stortingen" value={String(euro2Count)} />
        <Kpi label="€2 totaal" value={formatCents(totals.contributionCents)} />
        <Kpi label="Sponsors" value={`${totals.sponsorCount} · ${formatCents(totals.sponsorCents)}`} />
        <Kpi label="Accounts" value={String(accountCount)} />
        <Kpi label="Vandaag" value={String(todayCount)} />
        <Kpi label="Deze week" value={String(weekCount)} />
        <Kpi label="Mislukt" value={String(failed)} />
        <Kpi label="Refunds" value={String(refunds)} />
        <Kpi label="Referrals (geverifieerd)" value={String(referrals)} />
        <Kpi label="Fraud alerts open" value={String(fraudOpen)} />
      </div>

      <section className="card-dark p-6 space-y-4">
        <h2 className="font-display text-3xl">Mollie</h2>
        <p className="text-sm text-muted">
          {isMollieKey(mollieKey)
            ? `Sleutel actief: ${maskSecret(mollieKey)} (${mollieKey.startsWith("live_") ? "LIVE" : "test"})`
            : "Nog geen sleutel. Zonder sleutel werkt betalen niet."}
        </p>
        <form action={saveMollie} className="grid gap-3">
          <input
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder={isMollieKey(mollieKey) ? "Nieuwe sleutel (leeg = behouden)" : "test_... of live_..."}
          />
          <input name="webhookUrl" defaultValue={webhookUrl} placeholder="Webhook URL" />
          <button className="btn-yellow w-fit">Mollie opslaan</button>
        </form>
      </section>

      <section className="card-dark p-6 space-y-4">
        <h2 className="font-display text-3xl">Bericht naar iedereen</h2>
        <form action={sendBroadcast} className="grid gap-3">
          <input name="title" placeholder="Titel" required />
          <textarea name="body" rows={3} placeholder="Tekst" required />
          <input name="url" defaultValue="/" placeholder="Link, bv. /dashboard" />
          <button className="btn-yellow w-fit">Versturen</button>
        </form>
      </section>

      <section className="card-dark p-6 space-y-4">
        <h2 className="font-display text-3xl">Tekst bij doorsturen</h2>
        <p className="text-sm text-muted">
          Hier past u de tekst aan. Die gaat mee via WhatsApp, e-mail, Instagram, TikTok en
          Snapchat. Facebook toont de link met foto zoals op de site.
        </p>
        <form action={saveShareCopy} className="grid gap-3">
          <input
            name="subject"
            defaultValue={shareCopy.subject}
            placeholder={`Onderwerp e-mail, bv. ${SITE_NAME}`}
          />
          <textarea name="text" rows={5} defaultValue={shareCopy.text || SHARE_TEXT} required />
          <button className="btn-yellow w-fit">Deeltekst opslaan</button>
        </form>
      </section>

      <section className="card-dark p-6 space-y-4">
        <h2 className="font-display text-3xl">Betalingen</h2>
        <p>
          Status: {campaign.paymentsPaused ? "GEPAUZEERD" : "open (mits scenario A/B/C)"} · scenario:{" "}
          {campaign.goalFailureScenario || "NIET INGESTELD"}
        </p>
        <form action={togglePaymentsPaused}>
          <button className="btn-yellow">
            {campaign.paymentsPaused ? "Betalingen hervatten" : "Betalingen onmiddellijk pauzeren"}
          </button>
        </form>
        <form action={setGoalFailure} className="grid gap-3 md:grid-cols-2">
          <select name="scenario" defaultValue={campaign.goalFailureScenario || "A"}>
            <option value="A">A — terugbetalen</option>
            <option value="B">B — verlengen</option>
            <option value="C">C — alternatief</option>
          </select>
          <input name="extra" placeholder="Extra tekst voor scenario C" />
          <button className="btn-ghost md:col-span-2">Regeling bij niet-behalen doel vastleggen</button>
        </form>
        <p className="text-sm text-muted">{GOAL_FAILURE_OPTIONS.A}</p>
      </section>

      <section className="card-dark p-6 space-y-4">
        <h2 className="font-display text-3xl">Publicatiecheck</h2>
        <p className="text-sm text-yellow">
          LIVE mag alleen aan wanneer alles is afgevinkt. Env-flags: referral disabled=
          {String(DISABLED_PENDING_LEGAL_APPROVAL)}, prize={String(PRIZE_FEATURE_ENABLED)},
          multi-level={String(MULTI_LEVEL_REFERRALS)}.
        </p>
        <form action={saveChecklist} className="grid gap-2">
          {(Object.keys(CHECKLIST_LABELS) as ChecklistKey[]).map((key) => (
            <label key={key} className="flex items-center gap-3 normal-case tracking-normal text-white">
              <input type="checkbox" name={key} defaultChecked={checklist[key]} className="w-auto" />
              {CHECKLIST_LABELS[key]}
            </label>
          ))}
          <button className="btn-ghost mt-2 w-fit">Checklist opslaan</button>
        </form>
        <form action={tryGoLive}>
          <button className="btn-yellow" disabled={!liveReady}>
            {campaign.liveMode ? "Al LIVE" : liveReady ? "Schakel naar LIVE" : "LIVE geblokkeerd — checklist incompleet"}
          </button>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card-dark p-6 space-y-3">
          <h2 className="font-display text-2xl">Referralpunten</h2>
          <p className="text-sm text-muted">
            Publiek: {campaign.referralPublicEnabled ? "aan" : "uit"}. Eigen storting 5, directe
            doorstuurder +2, verdere lijn +1. De nieuwe storter krijgt geen extra bonus.
          </p>
          <form action={toggleReferralAdmin}>
            <button className="btn-ghost">Toggle referral-adminvlag</button>
          </form>
          <form action={savePointsConfig} className="grid grid-cols-2 gap-2">
            <input name="pointsOwnContribution" type="number" defaultValue={campaign.pointsOwnContribution} />
            <input name="pointsDirectReferral" type="number" defaultValue={campaign.pointsDirectReferral} />
            <input name="pointsReferredBonus" type="number" defaultValue={campaign.pointsReferredBonus} />
            <input name="pointsFurtherLevel" type="number" defaultValue={campaign.pointsFurtherLevel} />
            <button className="btn-ghost col-span-2">Puntenregels opslaan</button>
          </form>
        </div>
        <div className="card-dark p-6 space-y-3">
          <h2 className="font-display text-2xl">Winactie</h2>
          <p className="text-sm text-muted">
            Admin-toggle: {campaign.prizeFeatureEnabled ? "aan" : "uit"}. Publiek alleen met env + checklist.
          </p>
          <form action={togglePrizeAdmin}>
            <button className="btn-ghost">Toggle winactie-adminvlag</button>
          </form>
          <form action={lockAndDraw}>
            <input type="hidden" name="type" value="luck" />
            <button className="btn-ghost">Interne trekking (audit, niet publiek)</button>
          </form>
          {draws.map((d) => (
            <p key={d.id} className="text-sm">
              {d.status} · {d.type} · entries {d.validEntryCount} · winner {d.winnerId || "—"}
            </p>
          ))}
        </div>
      </section>

      <section className="card-dark p-6 space-y-3">
        <h2 className="font-display text-3xl">Organisator & verhaal</h2>
        <form action={saveOrganizer} className="grid gap-3">
          <input name="organizerName" defaultValue={campaign.organizerName} placeholder="Naam" />
          <input name="organizerEmail" defaultValue={campaign.organizerEmail} placeholder="E-mail" />
          <input name="organizerAddress" defaultValue={campaign.organizerAddress} placeholder="Adres" />
          <input name="organizerCompany" defaultValue={campaign.organizerCompany} placeholder="Onderneming" />
          <input name="vatNumber" defaultValue={campaign.vatNumber} placeholder="BTW" />
          <textarea name="storyText" rows={8} defaultValue={campaign.storyText} />
          <button className="btn-yellow w-fit">Opslaan</button>
        </form>
      </section>

      <section className="card-dark p-6 space-y-3">
        <h2 className="font-display text-3xl">Geld-uitsplitsing (JSON)</h2>
        <form action={saveMoneyBreakdown}>
          <textarea name="json" rows={12} defaultValue={campaign.moneyBreakdownJson} />
          <button className="btn-ghost mt-3">JSON opslaan</button>
        </form>
      </section>

      <section className="card-dark p-6 space-y-3">
        <h2 className="font-display text-3xl">Nieuwe update</h2>
        <form action={createUpdate} className="grid gap-3">
          <input name="title" placeholder="Titel" required />
          <textarea name="body" rows={4} placeholder="Tekst" required />
          <label className="flex items-center gap-2 normal-case tracking-normal">
            <input type="checkbox" name="published" defaultChecked className="w-auto" /> Publiceren
          </label>
          <button className="btn-yellow w-fit">Plaatsen</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-3xl">FAQ</h2>
        {faqs.map((f) => (
          <form key={f.id} action={saveFaq} className="card-dark grid gap-2 p-4">
            <input type="hidden" name="id" value={f.id} />
            <input name="question" defaultValue={f.question} />
            <textarea name="answer" rows={3} defaultValue={f.answer} />
            <label className="flex items-center gap-2 normal-case tracking-normal">
              <input type="checkbox" name="published" defaultChecked={f.published} className="w-auto" /> Gepubliceerd
            </label>
            <button className="btn-ghost w-fit">Opslaan</button>
          </form>
        ))}
      </section>

      <section>
        <h2 className="font-display text-3xl">Deelnemers</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Naam</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">GSM</th>
                <th className="p-2">€2</th>
                <th className="p-2">Sponsor</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const euro2 = u.payments.filter((p) => p.kind === "contribution");
                const sponsors = u.payments.filter((p) => p.kind === "sponsor" || p.kind === "pixel");
                return (
                <tr key={u.id} className="border-t border-white/10">
                  <td className="p-2">{u.participantNumber}</td>
                  <td className="p-2">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone || "—"}</td>
                  <td className="p-2">
                    {euro2.length} · {formatCents(euro2.reduce((s, p) => s + p.amountCents, 0))}
                  </td>
                  <td className="p-2">
                    {sponsors.length
                      ? formatCents(sponsors.reduce((s, p) => s + p.amountCents, 0))
                      : "—"}
                  </td>
                  <td className="p-2">
                    <a href={`/admin/deelnemer/${u.id}`} className="text-yellow">
                      Dashboard
                    </a>
                    {" · "}
                    <form action={blockUser} className="inline">
                      <input type="hidden" name="userId" value={u.id} />
                      <button className="text-yellow">{u.blocked ? "Deblokkeer" : "Blokkeer"}</button>
                    </form>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl">Recente betalingen</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="border-b border-white/10 pb-2">
              {p.status} · {p.kind} · {formatCents(p.amountCents)} · {p.user.email} · {p.id}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-3xl">Fraud flags</h2>
        <ul className="mt-4 space-y-3">
          {flags.map((f) => (
            <li key={f.id} className="card-dark p-4 text-sm">
              <p>
                {f.type} · {f.status} · {f.details}
              </p>
              <form action={reviewFraud} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={f.id} />
                <button name="status" value="reviewed" className="text-yellow">
                  Bekeken
                </button>
                <button name="status" value="dismissed" className="text-muted">
                  Wegcijferen
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-3xl">Discussie</h2>
        <p className="mt-2 text-sm text-muted">
          <a href="/discussie" className="text-yellow">Open de pagina</a>
        </p>
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="card-dark p-4 text-sm">
              <p className="text-yellow">
                {c.name} {c.published ? "" : "(verborgen)"}
              </p>
              <p className="mt-1 text-white/70">{c.body}</p>
              {c.published ? (
                <form action={hideComment} className="mt-2">
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-yellow">Verbergen</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-yellow">{value}</p>
    </div>
  );
}
