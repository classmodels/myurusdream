"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  blockedReason: string | null;
  goalFailureText: string | null;
  mollieReady: boolean;
  referralCode?: string;
};

export function MeedoenForm({ blockedReason, goalFailureText, mollieReady, referralCode }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [simulateId, setSimulateId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email")),
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName") || ""),
      acceptTerms: form.get("acceptTerms") === "on",
      acceptPrivacy: form.get("acceptPrivacy") === "on",
      acceptCampaign: form.get("acceptCampaign") === "on",
      referralCode: String(form.get("referralCode") || ""),
    };
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Er ging iets mis.");
      return;
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    if (data.simulate) {
      setSimulateId(data.paymentId);
      setStatus(data.notice);
    }
  }

  async function simulate() {
    if (!simulateId) return;
    setBusy(true);
    const res = await fetch("/api/checkout/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: simulateId }),
    });
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
    else {
      setBusy(false);
      setStatus(data.error || "Simulatie mislukt.");
    }
  }

  if (blockedReason) {
    return (
      <div className="card-dark p-8">
        <p className="font-display text-3xl text-yellow">Betalen staat nog niet open</p>
        <p className="mt-4 text-white/75">{blockedReason}</p>
        <p className="mt-4 text-sm text-muted">
          De organisator moet in het adminpaneel eerst kiezen wat er gebeurt als het doel niet
          wordt gehaald (scenario A, B of C).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card-dark space-y-5 p-8">
      <div>
        <label htmlFor="firstName">Voornaam</label>
        <input id="firstName" name="firstName" required className="mt-2" autoComplete="given-name" />
      </div>
      <div>
        <label htmlFor="lastName">Achternaam (optioneel)</label>
        <input id="lastName" name="lastName" className="mt-2" autoComplete="family-name" />
      </div>
      <div>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" required className="mt-2" autoComplete="email" />
      </div>
      <input type="hidden" name="referralCode" value={referralCode || ""} />

      {goalFailureText ? (
        <div className="border border-yellow/30 p-4 text-sm text-white/80">
          <p className="uppercase tracking-widest text-yellow">Als het doel niet wordt bereikt</p>
          <p className="mt-2">{goalFailureText}</p>
        </div>
      ) : null}

      <label className="flex items-start gap-3 text-sm normal-case tracking-normal text-white/80">
        <input type="checkbox" name="acceptTerms" className="mt-1 w-auto" required />
        <span>
          Ik aanvaard de{" "}
          <Link href="/voorwaarden" className="text-yellow">
            algemene voorwaarden
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm normal-case tracking-normal text-white/80">
        <input type="checkbox" name="acceptCampaign" className="mt-1 w-auto" required />
        <span>
          Ik aanvaard de{" "}
          <Link href="/campagnevoorwaarden" className="text-yellow">
            campagnevoorwaarden
          </Link>{" "}
          en begrijp: dit is geen goed doel, geen investering en geen winstbelofte.
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm normal-case tracking-normal text-white/80">
        <input type="checkbox" name="acceptPrivacy" className="mt-1 w-auto" required />
        <span>
          Ik heb het{" "}
          <Link href="/privacy" className="text-yellow">
            privacybeleid
          </Link>{" "}
          gelezen.
        </span>
      </label>

      {!mollieReady ? (
        <p className="border border-yellow/40 p-3 text-sm text-yellow">
          Testmodus: Mollie-sleutel ontbreekt. U kunt de betaling lokaal simuleren.
        </p>
      ) : (
        <p className="text-sm text-muted">
          U gaat naar de beveiligde checkout van Mollie (Bancontact, kaarten, Apple Pay indien
          beschikbaar). Wij bewaren geen kaartgegevens.
        </p>
      )}

      <button className="btn-yellow w-full" disabled={busy} type="submit">
        {busy ? "Even geduld…" : "Betaal €2"}
      </button>

      {status ? <p className="text-sm text-yellow">{status}</p> : null}

      {simulateId ? (
        <button type="button" className="btn-ghost w-full" onClick={simulate} disabled={busy}>
          Simuleer betaling (lokaal)
        </button>
      ) : null}
    </form>
  );
}
