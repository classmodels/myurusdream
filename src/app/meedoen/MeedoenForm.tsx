"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LegalChecks } from "@/app/sponsors/SponsorForm";
import { REF_COOKIE } from "@/lib/referral";

type Props = {
  blockedReason: string | null;
  mollieReady: boolean;
  referralCode?: string;
};

export function MeedoenForm({ blockedReason, mollieReady, referralCode }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [simulateId, setSimulateId] = useState<string | null>(null);
  const [refCode, setRefCode] = useState(referralCode || "");

  useEffect(() => {
    if (referralCode) {
      setRefCode(referralCode);
      return;
    }
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${REF_COOKIE}=([^;]+)`));
    if (!match) return;
    try {
      setRefCode(decodeURIComponent(match[1]).trim().slice(0, 32));
    } catch {
      /* ignore */
    }
  }, [referralCode]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email")),
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      phone: String(form.get("phone")),
      acceptTerms: form.get("acceptLegal") === "on",
      acceptPrivacy: form.get("acceptLegal") === "on",
      acceptCampaign: form.get("acceptLegal") === "on",
      referralCode: String(form.get("referralCode") || refCode || ""),
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
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="btn-ghost">
            Terug naar de homepage
          </Link>
          <Link href="/volg-alles" className="text-sm uppercase tracking-widest text-yellow">
            Bekijk de live teller →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="meedoen-form card-dark space-y-3 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="firstName">Voornaam</label>
          <input id="firstName" name="firstName" required className="mt-1" autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="lastName">Achternaam</label>
          <input id="lastName" name="lastName" required className="mt-1" autoComplete="family-name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required className="mt-1" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone">GSM-nummer</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="mt-1"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>
      <input type="hidden" name="referralCode" value={refCode} />
      {refCode ? (
        <p className="border border-yellow/35 bg-yellow/5 p-2.5 text-[0.7rem] leading-snug text-white/75">
          U bent uitgenodigd via iemands persoonlijke link. Bij een bevestigde €2 krijgt u 5
          punten — niet meer, niet minder. Wie u uitnodigde krijgt +2.
        </p>
      ) : null}

      {!mollieReady ? (
        <p className="border border-yellow/40 p-2.5 text-[0.7rem] leading-snug text-yellow">
          Testmodus: Mollie-sleutel ontbreekt. U kunt de betaling lokaal simuleren.
        </p>
      ) : (
        <p className="text-[0.7rem] leading-snug text-muted">
          U gaat naar de beveiligde checkout van Mollie (Bancontact, kaarten, Apple Pay indien
          beschikbaar). Wij bewaren geen kaartgegevens.
        </p>
      )}

      <LegalChecks />

      <button className="btn-yellow w-full !px-3 !py-2 !text-[0.7rem]" disabled={busy} type="submit">
        {busy ? "Even geduld…" : "Betaal €2"}
      </button>

      {status ? <p className="text-[0.7rem] text-yellow">{status}</p> : null}

      {simulateId ? (
        <button type="button" className="btn-ghost w-full !px-3 !py-2 !text-[0.7rem]" onClick={simulate} disabled={busy}>
          Simuleer betaling (lokaal)
        </button>
      ) : null}
    </form>
  );
}
