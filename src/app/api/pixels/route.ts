import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaign";
import { occupiedPixels } from "@/lib/ad-users";
import { PIXEL_COLS, PIXEL_ROWS } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export async function GET() {
  const campaign = await getCampaign();
  const occupied = await occupiedPixels(campaign.id);
  return NextResponse.json({
    cols: PIXEL_COLS,
    rows: PIXEL_ROWS,
    occupied,
  });
}
