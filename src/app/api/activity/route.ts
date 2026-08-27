import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCampaign, getLiveTotals } from "@/lib/campaign";

export const dynamic = "force-dynamic";

export async function GET() {
  const campaign = await getCampaign();
  const totals = await getLiveTotals(campaign.id);
  const payments = await prisma.payment.findMany({
    where: { campaignId: campaign.id, status: "paid" },
    orderBy: { paidAt: "desc" },
    take: 12,
    select: { amountCents: true, paidAt: true },
  });

  const items: { text: string; at: string }[] = payments.map((p) => ({
    text: `Nieuwe bijdrage van €${(p.amountCents / 100).toFixed(0)}.`,
    at: (p.paidAt ?? new Date()).toISOString(),
  }));

  if (totals.participantCount > 0) {
    items.unshift({
      text: `${totals.participantCount.toLocaleString("nl-BE")} deelnemer${totals.participantCount === 1 ? "" : "s"} in totaal.`,
      at: new Date().toISOString(),
    });
  } else {
    items.push({
      text: "Nog geen bevestigde bijdragen. De teller staat op €0.",
      at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ items: items.slice(0, 12) });
}
