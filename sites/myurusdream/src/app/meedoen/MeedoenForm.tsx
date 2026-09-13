"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LegalChecks } from "@/app/sponsors/SponsorForm";
import { persistReferralClient, readStoredReferralClient } from "@/lib/referral";
import { useDict } from "@/lib/i18n/client";

type Props = {
  blockedReason: string | null;
  mollieReady: boolean;
  referralCode?: string;
};

export function MeedoenForm({ blockedReason, mollieReady, referralCode }: Props) {
  const dict = useDict();
  const m = dict.meedoen;
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [simulateId, setSimulateId] = useState<string | null>(null);
  const [refCode, setRefCode] = useState(referralCode || "");

  useEffect(() => {
    if (referralCode) {
      persistReferralClient(referralCode);
      setRefCode(referralCode);
      return;
    }
    const stored = readStoredReferralClient();
    if (stored) setRefCode(stored);
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
      setStatus(data.error || dict.common.error);
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
      setStatus(data.error || dict.common.error);
    }
  }

  if (blockedReason) {
    return (
      <div className="card-dark p-8">
        <p className="font-display text-3xl text-yellow">{m.payClosed}</p>
        <p className="mt-4 text-white/75">{blockedReason}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/" className="btn-ghost">
            {m.backHome}
          </Link>
          <Link href="/volg-alles" className="text-sm uppercase tracking-widest text-yellow">
            {m.liveCounter}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="meedoen-form card-dark space-y-3 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="firstName">{m.firstName}</label>
          <input id="firstName" name="firstName" required className="mt-1" autoComplete="given-name" />
        </div>
        <div>
          <label htmlFor="lastName">{m.lastName}</label>
          <input id="lastName" name="lastName" required className="mt-1" autoComplete="family-name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="email">{m.email}</label>
          <input id="email" name="email" type="email" required className="mt-1" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone">{m.phone}</label>
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
          {m.invited}
        </p>
      ) : null}

      {!mollieReady ? (
        <p className="border border-yellow/40 p-2.5 text-[0.7rem] leading-snug text-yellow">
          {m.testMode}
        </p>
      ) : (
        <p className="text-[0.7rem] leading-snug text-muted">{m.mollieNote}</p>
      )}

      <LegalChecks />

      <button className="btn-yellow w-full !px-3 !py-2 !text-[0.7rem]" disabled={busy} type="submit">
        {busy ? m.busy : m.pay}
      </button>

      {status ? <p className="text-[0.7rem] text-yellow">{status}</p> : null}

      {simulateId ? (
        <button type="button" className="btn-ghost w-full !px-3 !py-2 !text-[0.7rem]" onClick={simulate} disabled={busy}>
          {m.simulate}
        </button>
      ) : null}
    </form>
  );
}
