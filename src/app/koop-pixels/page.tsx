import type { Metadata } from "next";
import { PixelWall } from "@/app/pixels/PixelWall";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { getMollie, mollieConfigured } from "@/lib/mollie";
import { occupiedPixels } from "@/lib/ad-users";
import { EXAMPLE_PIXELS, withoutTitleReserveAds } from "@/lib/sponsors";
import { prisma } from "@/lib/prisma";
import { fulfillPaidPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inschrijven Pixelwall",
  description: "Kies uw vakken op de Pixelwall en rond de inschrijving af, zoals bij advertenties.",
};

export default async function KoopPixelsPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string }>;
}) {
  const { pid } = await searchParams;
  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);

  let paidNotice: "paid" | "pending" | null = null;
  if (pid) {
    const payment = await prisma.payment.findUnique({ where: { id: pid } });
    if (payment?.kind === "pixel") {
      if ((await mollieConfigured()) && payment.mollieId && payment.status !== "paid") {
        try {
          const remote = await (await getMollie()).payments.get(payment.mollieId);
          if (remote.status === "paid") {
            await fulfillPaidPayment(payment.id);
          }
        } catch {
          /* webhook may still arrive */
        }
      }
      const latest = await prisma.payment.findUnique({ where: { id: pid } });
      paidNotice = latest?.status === "paid" ? "paid" : "pending";
    }
  }

  const live = await occupiedPixels(campaign.id);
  const occupied = withoutTitleReserveAds(live.length ? live : EXAMPLE_PIXELS);

  return (
    <div className="relative isolate min-h-[100svh] overflow-x-clip">
      <img src="/images/urus-night.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/78" />
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-28">
        <p className="font-display text-[0.7rem] tracking-[0.18em] text-yellow">
          Bedankt om reclame te willen zetten
        </p>
        <h1 className="mt-2 font-display text-xl leading-[1.2] md:text-2xl">
          Kies uw vakken en rond uw inschrijving af
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          U kiest uw plek op de Pixelwall, vult de gegevens in, betaalt, en uw logo komt op de
          muur. Vanaf €10 per vak.
        </p>
        {paidNotice === "paid" ? (
          <p className="mt-6 border border-yellow/40 bg-black/40 p-3 text-sm text-yellow">
            Betaling bevestigd. Uw vakken staan op de Pixelwall.
          </p>
        ) : paidNotice === "pending" ? (
          <p className="mt-6 border border-yellow/40 bg-black/40 p-3 text-sm text-yellow">
            We wachten op de bevestiging van Mollie. Vernieuw de pagina als uw vakken nog niet
            zichtbaar zijn.
          </p>
        ) : null}
        <div className="mt-6">
          <PixelWall
            blockedReason={gate.allowed ? null : gate.reason}
            goalFailureText={campaign.goalFailureText}
            mollieReady={await mollieConfigured()}
            initialOccupied={occupied}
          />
        </div>
      </div>
    </div>
  );
}
