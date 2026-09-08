"use client";

import { useState } from "react";
import { readStoredReferralClient } from "@/lib/referral";
import { useDict } from "@/lib/i18n/client";

export function RepeatDonateButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const dict = useDict();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const buttonLabel = label ?? dict.meedoen.repeat;

  async function donate() {
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/checkout/repeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: readStoredReferralClient() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(data.error || dict.common.error);
      return;
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (data.simulate && data.paymentId) {
      const sim = await fetch("/api/checkout/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: data.paymentId }),
      });
      const simData = await sim.json();
      if (simData.redirect) {
        window.location.href = simData.redirect;
        return;
      }
      setBusy(false);
      setStatus(simData.error || dict.common.error);
      return;
    }
    setBusy(false);
    setStatus(dict.common.error);
  }

  return (
    <div className={className}>
      <button type="button" className="btn-yellow" disabled={busy} onClick={donate}>
        {busy ? dict.common.loading : buttonLabel}
      </button>
      {status ? <p className="mt-2 text-sm text-yellow">{status}</p> : null}
    </div>
  );
}
