import { NextResponse } from "next/server";
import { getPublicCampaignView } from "@/lib/campaign";
import { formatCents } from "@/lib/money";
import { uniqueVisitorCount, onlineVisitorCount } from "@/lib/visitors";

export const dynamic = "force-dynamic";

export async function GET() {
  const view = await getPublicCampaignView();
  return NextResponse.json({
    raisedCents: view.netCents,
    raisedLabel: formatCents(view.netCents),
    goalCents: view.campaign.goalCents,
    goalLabel: formatCents(view.campaign.goalCents),
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
    uniqueVisitors: await uniqueVisitorCount(),
    onlineVisitors: await onlineVisitorCount(),
    liveMode: view.campaign.liveMode,
    status: view.campaign.status,
  });
}
