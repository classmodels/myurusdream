"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveClientSiteSession } from "@/lib/client-site-session";
import {
  PORTAL_DEMO,
  createDefaultPortalState,
  loadPortalState,
  savePortalState,
  setPortalSession,
} from "@/lib/portal";

export function PortalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const trimmed = email.trim().toLowerCase();
    try {
      const res = await fetch("/api/portal-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, password }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          slug: string;
          publicSlug: string;
          liveSitePath: string;
          title: string;
          previewUrl: string;
          progress: number;
          accessCode: string;
        };
        saveClientSiteSession(data);
        router.push("/portaal/mijn-site");
        return;
      }

      const demoOk = trimmed === PORTAL_DEMO.email && password === PORTAL_DEMO.password;
      if (!demoOk) {
        setError("Onjuiste login.");
        return;
      }
      setPortalSession(trimmed);
      const existing = loadPortalState();
      if (!existing || existing.email !== PORTAL_DEMO.email) {
        savePortalState(createDefaultPortalState(PORTAL_DEMO.email));
      }
      saveClientSiteSession({
        slug: "demo",
        publicSlug: "myurusdream",
        liveSitePath: PORTAL_DEMO.liveSitePath,
        title: "Myurusdream",
        previewUrl: PORTAL_DEMO.liveSitePath,
        progress: 70,
        accessCode: "",
      });
      router.push("/portaal/mijn-site");
    } catch {
      setError("Geen verbinding.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-xl border border-[#d7e3f2] bg-white p-6 shadow-[0_16px_36px_rgba(0,0,0,0.22)] md:p-8">
      <label className="block text-sm font-semibold text-ink-on-light">
        E-mail
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-1.5"
          autoComplete="username"
          placeholder="klant@bedrijf.be"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-ink-on-light">
        Wachtwoord
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field mt-1.5"
          autoComplete="current-password"
        />
      </label>
      {error && <p className="mt-3 text-sm text-coral">{error}</p>}
      <button type="submit" className="btn-primary mt-6 w-full text-sm" disabled={busy}>
        Inloggen
      </button>
      <p className="mt-4 rounded-lg bg-[#f4f7fb] px-3 py-2 text-xs text-muted-on-light">
        Klantlogin komt uit beheer (e-mail, wachtwoord en welke site). Daarna ziet u de website.
        <br />
        Demo van alleen het stappenplan: <strong className="text-ink-on-light">{PORTAL_DEMO.email}</strong> /{" "}
        <strong className="text-ink-on-light">{PORTAL_DEMO.password}</strong>
      </p>
    </form>
  );
}
