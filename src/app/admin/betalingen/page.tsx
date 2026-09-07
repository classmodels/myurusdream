import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { getCampaign } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { getMollieApiKey, getMollieWebhookUrl, isMollieKey } from "@/lib/mollie";
import { maskSecret } from "@/lib/secret-box";
import { GOAL_FAILURE_OPTIONS } from "@/lib/constants";
import { saveMollie, setGoalFailure, togglePaymentsPaused } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBetalingenPage() {
  await requireAdminPage();
  const campaign = await getCampaign();
  const [mollieKey, webhookUrl, payments] = await Promise.all([
    getMollieApiKey(),
    getMollieWebhookUrl(),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { user: true } }),
  ]);

  return (
    <AdminChrome title="Betalingen">
      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Mollie</h2>
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

      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Pauze & doel</h2>
        <p>
          Status: {campaign.paymentsPaused ? "GEPAUZEERD" : "open"} · scenario:{" "}
          {campaign.goalFailureScenario || "NIET INGESTELD"}
        </p>
        <form action={togglePaymentsPaused}>
          <button className="btn-yellow">
            {campaign.paymentsPaused ? "Betalingen hervatten" : "Betalingen pauzeren"}
          </button>
        </form>
        <form action={setGoalFailure} className="grid gap-3 md:grid-cols-2">
          <select name="scenario" defaultValue={campaign.goalFailureScenario || "A"}>
            <option value="A">A — terugbetalen</option>
            <option value="B">B — verlengen</option>
            <option value="C">C — alternatief</option>
          </select>
          <input name="extra" placeholder="Extra tekst voor scenario C" />
          <button className="btn-ghost md:col-span-2">Regeling bij niet-behalen doel</button>
        </form>
        <p className="text-sm text-muted">{GOAL_FAILURE_OPTIONS.A}</p>
      </section>

      <section>
        <h2 className="font-display text-2xl">Recente betalingen</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="border-b border-white/10 pb-2">
              {p.status} · {p.kind} · {formatCents(p.amountCents)} · {p.user.email} · {p.id}
            </li>
          ))}
        </ul>
      </section>
    </AdminChrome>
  );
}
