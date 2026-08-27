import { MeedoenForm } from "./MeedoenForm";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { mollieConfigured } from "@/lib/mollie";
import { NOT_CHARITY_LINES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function MeedoenPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-28 md:grid-cols-2">
      <div>
        <p className="font-display text-sm tracking-[0.3em] text-yellow">Meedoen</p>
        <h1 className="mt-3 font-display text-5xl">Eenmalig €2</h1>
        <p className="mt-4 text-white/75">
          Geen account verplicht vooraf. Na betaling krijgt u toegang tot uw dashboard.
        </p>
        <ul className="mt-8 space-y-2 text-sm text-yellow">
          {NOT_CHARITY_LINES.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>
      <MeedoenForm
        blockedReason={gate.allowed ? null : gate.reason}
        goalFailureText={campaign.goalFailureText}
        mollieReady={mollieConfigured()}
        referralCode={ref}
      />
    </div>
  );
}
