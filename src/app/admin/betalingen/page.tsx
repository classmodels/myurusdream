import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { getCampaign } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { getMollieApiKey, getMollieWebhookUrl, isMollieKey } from "@/lib/mollie";
import { maskSecret } from "@/lib/secret-box";
import { GOAL_FAILURE_OPTIONS } from "@/lib/constants";
import { saveMollie, setGoalFailure, togglePaymentsPaused, deletePayment } from "../actions";
import { Accordion } from "@/components/Accordion";

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
      <Accordion title="Mollie" compact className="">
        <div className="space-y-4 px-4 py-4">
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
        </div>
      </Accordion>

      <Accordion title="Pauze & doel" compact className="">
        <div className="space-y-4 px-4 py-4">
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
        </div>
      </Accordion>

      <Accordion title="Recente betalingen" compact className="">
        <ul className="space-y-2 px-4 py-3 text-sm">
          {payments.length ? (
            payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0">
                <span>
                  {p.status} · {p.kind} · {formatCents(p.amountCents)} · {p.user.email}
                </span>
                <form action={deletePayment}>
                  <input type="hidden" name="paymentId" value={p.id} />
                  <button type="submit" className="btn-danger">
                    Verwijderen
                  </button>
                </form>
              </li>
            ))
          ) : (
            <li className="text-muted">Nog geen betalingen.</li>
          )}
        </ul>
      </Accordion>
    </AdminChrome>
  );
}
