"use client";

import { useState } from "react";

export function RepeatDonateButton({
  className,
  label = "Nog eens €2 storten",
}: {
  className?: string;
  label?: string;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function donate() {
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/checkout/repeat", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setBusy(false);
      setStatus(data.error || "Er ging iets mis.");
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
      setStatus(simData.error || "Simulatie mislukt.");
      return;
    }
    setBusy(false);
    setStatus("Kon de betaling niet starten.");
  }

  return (
    <div className={className}>
      <button type="button" className="btn-yellow" disabled={busy} onClick={donate}>
        {busy ? "Even geduld…" : label}
      </button>
      {status ? <p className="mt-2 text-sm text-yellow">{status}</p> : null}
    </div>
  );
}
