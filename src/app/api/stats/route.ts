import { NextResponse } from "next/server";
import { getPublicCampaignView } from "@/lib/campaign";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function GET() {
  const view = await getPublicCampaignView();
  return NextResponse.json({
    raisedCents: view.totals.raisedCents,
    raisedLabel: formatCents(view.totals.raisedCents),
    goalCents: view.campaign.goalCents,
    goalLabel: formatCents(view.campaign.goalCents),
    participantCount: view.totals.participantCount,
    targetContributions: view.campaign.targetContributions,
    remainingCents: view.remainingCents,
    remainingPeople: view.remainingPeople,
    percent: view.percent,
    liveMode: view.campaign.liveMode,
    status: view.campaign.status,
  });
}
