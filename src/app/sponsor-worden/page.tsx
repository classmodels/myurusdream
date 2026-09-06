import type { Metadata } from "next";
import { SponsorForm } from "@/app/sponsors/SponsorForm";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { parseSponsorTierParam } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Word sponsor",
  description: "Kies uw sponsorplek en rond de inschrijving af.",
};

export default async function SponsorWordenPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const initialTier = parseSponsorTierParam(tier);
  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);

  return (
    <div className="relative isolate min-h-[100svh] overflow-hidden">
      <img src="/images/urus-villa.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/78" />
      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-28">
        <p className="font-display text-[0.7rem] tracking-[0.18em] text-yellow">
          Bedankt om te willen sponsoren
        </p>
        <h1 className="mt-2 font-display text-xl leading-[1.2] md:text-2xl">
          Kies uw plek en rond uw inschrijving af
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Zelfde stappen als bij €2: u vult de gegevens in, betaalt, en uw reclame komt op de site.
        </p>
        <div className="mt-6">
          <SponsorForm
            key={initialTier}
            blockedReason={gate.allowed ? null : gate.reason}
            initialTier={initialTier}
          />
        </div>
      </div>
    </div>
  );
}
