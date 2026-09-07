import { requireAdminPage } from "@/lib/admin";
import { AdminChrome } from "@/components/AdminChrome";
import { getCampaign } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import {
  canSwitchLive,
  parseChecklist,
} from "@/lib/flags";
import { CHECKLIST_LABELS, type ChecklistKey } from "@/lib/constants";
import {
  lockAndDraw,
  saveChecklist,
  savePointsConfig,
  togglePrizeAdmin,
  toggleReferralAdmin,
  tryGoLive,
} from "../actions";
import { hideComment } from "@/app/discussie/actions";

export const dynamic = "force-dynamic";

export default async function AdminInstellingenPage() {
  await requireAdminPage();
  const campaign = await getCampaign();
  const [draws, comments] = await Promise.all([
    prisma.draw.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.discussionPost.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const checklist = parseChecklist(campaign.checklistJson);
  const liveReady = canSwitchLive(campaign);

  return (
    <AdminChrome title="Instellingen">
      <section className="card-dark space-y-4 p-6">
        <h2 className="font-display text-2xl">Publicatie / LIVE</h2>
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
        <div className="card-dark space-y-3 p-6">
          <h2 className="font-display text-2xl">Punten</h2>
          <form action={toggleReferralAdmin}>
            <button className="btn-ghost">
              Referral {campaign.referralPublicEnabled ? "uitzetten" : "aanzetten"}
            </button>
          </form>
          <form action={savePointsConfig} className="grid grid-cols-2 gap-2">
            <input name="pointsOwnContribution" type="number" defaultValue={campaign.pointsOwnContribution} />
            <input name="pointsDirectReferral" type="number" defaultValue={campaign.pointsDirectReferral} />
            <input name="pointsReferredBonus" type="number" defaultValue={campaign.pointsReferredBonus} />
            <input name="pointsFurtherLevel" type="number" defaultValue={campaign.pointsFurtherLevel} />
            <button className="btn-ghost col-span-2">Puntenregels opslaan</button>
          </form>
        </div>
        <div className="card-dark space-y-3 p-6">
          <h2 className="font-display text-2xl">Winactie</h2>
          <form action={togglePrizeAdmin}>
            <button className="btn-ghost">
              Winactie {campaign.prizeFeatureEnabled ? "uitzetten" : "aanzetten"}
            </button>
          </form>
          <form action={lockAndDraw}>
            <input type="hidden" name="type" value="luck" />
            <button className="btn-ghost">Interne trekking</button>
          </form>
          {draws.map((d) => (
            <p key={d.id} className="text-sm">
              {d.status} · {d.type} · {d.validEntryCount} · {d.winnerId || "—"}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Discussie</h2>
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
    </AdminChrome>
  );
}
