import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PixelWall } from "./PixelWall";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { mollieConfigured } from "@/lib/mollie";
import { occupiedPixels } from "@/lib/ad-users";
import { EXAMPLE_PIXELS, pixelOrderHref, withoutTitleReserveAds } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pixelwall",
  description:
    "De Pixelwall: vakken met logo en reclame. Schrijf in vanaf €10, zoals bij advertenties.",
};

export default async function PixelsPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string }>;
}) {
  const { pid } = await searchParams;
  if (pid) redirect(`${pixelOrderHref()}?pid=${encodeURIComponent(pid)}`);

  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  const live = await occupiedPixels(campaign.id);
  const occupied = withoutTitleReserveAds(live.length ? live : EXAMPLE_PIXELS);

  return (
    <div className="bg-black pb-16 pt-24">
      <section id="pixelmuur" className="px-3 sm:px-4 md:px-5">
        <div className="mx-auto max-w-[1600px]">
          <PixelWall
            blockedReason={gate.allowed ? null : gate.reason}
            goalFailureText={campaign.goalFailureText}
            mollieReady={await mollieConfigured()}
            initialOccupied={occupied}
            orderable
            fullBleed
          />
        </div>
      </section>
    </div>
  );
}
