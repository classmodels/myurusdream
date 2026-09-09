"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LOGO_RECOMMENDED_PX,
  SPONSOR_TIERS,
  type SponsorTierId,
} from "@/lib/sponsors";
import { formatCents } from "@/lib/money";
import { compressLogo } from "@/lib/compress-logo";
import { HeadlineBillboard } from "@/components/SponsorShowcase";
import { normalizeWebsiteUrl } from "@/lib/website";
import { useDict } from "@/lib/i18n/client";

type Props = {
  blockedReason: string | null;
  initialTier?: SponsorTierId;
};

export function SponsorForm({ blockedReason, initialTier = "gold" }: Props) {
  const start = SPONSOR_TIERS.find((t) => t.id === initialTier) || SPONSOR_TIERS[1];
  const [tierId, setTierId] = useState<SponsorTierId>(start.id);
  const selected = SPONSOR_TIERS.find((t) => t.id === tierId) || start;
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [url, setUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [simulateId, setSimulateId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const payCents = selected.minCents;

  useEffect(() => {
    const t = SPONSOR_TIERS.find((x) => x.id === initialTier) || SPONSOR_TIERS[1];
    setTierId(t.id);
  }, [initialTier]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#inschrijven") return;
    const el = document.getElementById("inschrijven");
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "instant", block: "start" });
    });
  }, [initialTier]);

  function pickTier(id: SponsorTierId) {
    const t = SPONSOR_TIERS.find((x) => x.id === id);
    if (!t) return;
    setTierId(id);
  }

  async function onLogo(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setStatus(null);
    setLogoName(file.name);
    try {
      const compressed = await compressLogo(file);
      // Toon meteen in het voorbeeld, nog vóór de server-upload.
      setLogoPreview(compressed.dataUrl);
      const res = await fetch("/api/pixels/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLogoUrl(null);
        setStatus(data.error || "Logo uploaden mislukte. Het voorbeeld ziet u wel al.");
        return;
      }
      setLogoUrl(data.url);
    } catch {
      setLogoPreview(null);
      setLogoUrl(null);
      setLogoName(null);
      setStatus("Dit bestand kon niet als logo worden gelezen. Probeer JPG of PNG (geen HEIC).");
    } finally {
      setBusy(false);
    }
  }

  function clearLogo() {
    setLogoUrl(null);
    setLogoPreview(null);
    setLogoName(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const website = url.trim() ? normalizeWebsiteUrl(url) : "";
    if (url.trim() && !website) {
      setBusy(false);
      setStatus("Vul een geldige website in, bijvoorbeeld www.bakkerij.be");
      return;
    }
    const form = new FormData(e.currentTarget);
    const payload = {
      kind: "sponsor",
      email: String(form.get("email")),
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
      phone: String(form.get("phone")),
      vatNumber: String(form.get("vatNumber")),
      invoiceCompany: String(form.get("invoiceCompany")),
      address: String(form.get("address")),
      company: name.trim() || String(form.get("invoiceCompany") || "").trim() || "Sponsor",
      url: website || "",
      pixelLabel: tagline.trim(),
      pixelImage: logoUrl || "",
      amountCents: payCents,
      acceptTerms: form.get("acceptLegal") === "on",
      acceptPrivacy: form.get("acceptLegal") === "on",
      acceptCampaign: form.get("acceptLegal") === "on",
    };
    try {
      const res = await fetch("/api/checkout/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Er ging iets mis.");
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
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
        setSimulateId(data.paymentId);
        setStatus(simData.error || "Bevestig hieronder om de inschrijving te zien.");
        return;
      }
      setStatus(data.error || "Betalen kon niet worden gestart. Probeer opnieuw.");
    } catch {
      setStatus("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmLocalPayment() {
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
      setStatus(data.error || "Betaling bevestigen mislukte.");
    }
  }

  if (blockedReason) {
    return (
      <div className="card-dark p-8">
        <p className="font-display text-3xl text-yellow">Betalen staat nog niet open</p>
        <p className="mt-4 text-white/75">{blockedReason}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="sponsor-form grid items-start gap-5 lg:grid-cols-2">
      <div className="card-dark space-y-3 p-4 sm:p-5">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="company">Titel (optioneel)</label>
              <input
                id="company"
                name="company"
                className="mt-1"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div>
              <label htmlFor="tagline">Subtitel (optioneel)</label>
              <input
                id="tagline"
                name="tagline"
                className="mt-1"
                maxLength={80}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="url">Link naar uw website</label>
            <input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="url"
              className="mt-1"
              placeholder="www.bakkerij.be"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="sponsorLogo">Logo</label>
            <div className="relative mt-1 flex flex-wrap items-center gap-2">
              <input
                ref={logoInputRef}
                id="sponsorLogo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="logo-file-native"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
              <label htmlFor="sponsorLogo" className="logo-file-btn">
                {logoName ? "Ander logo" : "Kies logo"}
              </label>
              {logoPreview || logoName ? (
                <button type="button" className="logo-file-clear" onClick={clearLogo}>
                  Wissen
                </button>
              ) : null}
              <span className="text-[9px] leading-none tracking-wide text-white/45">
                Aanbevolen: {LOGO_RECOMMENDED_PX[selected.id]}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-yellow/40 bg-black/40 p-2.5">
          <p className="text-[8px] uppercase tracking-[0.16em] text-yellow">Voorbeeld op de site</p>
          <div className="mt-2">
            <SponsorLivePreview
              tier={selected.id}
              name={name}
              tagline={tagline}
              logo={logoPreview || logoUrl}
            />
          </div>
        </div>
      </div>

      <div className="card-dark space-y-3 p-4 sm:p-5 lg:sticky lg:top-24">
        <p className="font-display text-sm tracking-wide text-yellow sm:text-base">Kies uw plaats</p>

        <div className="grid gap-1.5">
          {SPONSOR_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickTier(t.id)}
              className={`border px-3 py-2 text-left ${
                tierId === t.id ? "border-yellow bg-yellow/10" : "border-white/15 hover:border-yellow/50"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-sm">{t.name}</span>
                <span className="text-[0.7rem] text-yellow">{t.priceLabel}</span>
              </span>
              <span className="mt-0.5 block text-[0.65rem] leading-snug text-white/55">{t.placement}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 border border-yellow/40 bg-black/40 p-2.5">
          <p className="text-[8px] uppercase tracking-[0.16em] text-yellow">Factuurgegevens</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="firstName">Voornaam</label>
              <input id="firstName" name="firstName" required className="mt-1" autoComplete="given-name" />
            </div>
            <div>
              <label htmlFor="lastName">Achternaam</label>
              <input id="lastName" name="lastName" required className="mt-1" autoComplete="family-name" />
            </div>
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
            <div>
              <label htmlFor="invoiceCompany">Bedrijfsnaam</label>
              <input
                id="invoiceCompany"
                name="invoiceCompany"
                required
                className="mt-1"
                autoComplete="organization"
              />
            </div>
            <div>
              <label htmlFor="vatNumber">BTW-nummer</label>
              <input id="vatNumber" name="vatNumber" required className="mt-1" autoComplete="off" />
            </div>
          </div>
          <div>
            <label htmlFor="address">Adres</label>
            <textarea
              id="address"
              name="address"
              required
              rows={2}
              className="mt-1"
              autoComplete="street-address"
            />
          </div>
          <p className="text-[0.65rem] leading-snug text-white/60">
            Na de afloopdatum kan de campagne verlengd of stopgezet worden. Sponsorgeld wordt niet
            terugbetaald.
          </p>
        </div>

        <LegalChecks />

        <button className="btn-yellow w-full !px-3 !py-2 !text-[0.7rem]" disabled={busy} type="submit">
          {busy ? "Even geduld…" : `Betaal ${formatCents(payCents)} als ${selected.name}`}
        </button>
        {status ? <p className="text-[0.7rem] text-yellow">{status}</p> : null}
        {simulateId ? (
          <button type="button" className="btn-ghost w-full !px-3 !py-2 !text-[0.7rem]" onClick={confirmLocalPayment} disabled={busy}>
            Simuleer betaling
          </button>
        ) : null}
      </div>
    </form>
  );
}

function SponsorLivePreview({
  tier,
  name,
  tagline,
  logo,
}: {
  tier: SponsorTierId;
  name: string;
  tagline: string;
  logo: string | null;
}) {
  return (
    <HeadlineBillboard
      name={name}
      tagline={tagline}
      logo={logo}
      size="preview"
      tier={tier}
    />
  );
}

export function LegalChecks() {
  const dict = useDict();
  return (
    <label className="legal-check legal-check-compact">
      <input type="checkbox" name="acceptLegal" required />
      <span>
        {dict.meedoen.acceptPrefix}{" "}
        <Link href="/voorwaarden#algemene-voorwaarden" className="text-yellow">
          {dict.legalLinks.termsLower}
        </Link>
        {dict.meedoen.acceptMid1}{" "}
        <Link href="/voorwaarden#campagnevoorwaarden" className="text-yellow">
          {dict.legalLinks.campaignLower}
        </Link>{" "}
        {dict.meedoen.acceptMid2}{" "}
        <Link href="/voorwaarden#privacybeleid" className="text-yellow">
          {dict.legalLinks.privacyLower}
        </Link>
        {dict.meedoen.acceptEnd}
      </span>
    </label>
  );
}
