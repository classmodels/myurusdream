"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { clearClientSiteSession, saveClientSiteSession } from "@/lib/client-site-session";
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
        setPortalSession(trimmed);
        const existing = loadPortalState();
        const next = !existing || existing.email !== trimmed
          ? { ...createDefaultPortalState(trimmed), projectName: data.title, clientName: data.title, previewUrl: data.liveSitePath || "" }
          : { ...existing, previewUrl: data.liveSitePath || existing.previewUrl };
        savePortalState(next);
        void fetch("/api/portal-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "login", email: trimmed }),
        });
        router.push("/portaal/project");
        return;
      }

      const demoOk = trimmed === PORTAL_DEMO.email && password === PORTAL_DEMO.password;
      if (!demoOk) {
        setError("Onjuiste login.");
        return;
      }
      setPortalSession(trimmed);
      clearClientSiteSession();
      const existing = loadPortalState();
      if (!existing || existing.email !== PORTAL_DEMO.email) {
        const fresh = createDefaultPortalState(PORTAL_DEMO.email);
        savePortalState({ ...fresh, previewUrl: "" });
      }
      void fetch("/api/portal-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: trimmed }),
      });
      router.push("/portaal/project");
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
        Na inloggen blijft u in het portaal. Uw website verschijnt daar alleen als SiteButler die gekoppeld heeft.
      </p>
      <p className="mt-3 text-center text-xs text-muted-on-light">
        SiteButler:{" "}
        <a href="/portaal/admin" className="font-semibold text-ink-on-light underline">
          administrator backstage
        </a>
      </p>
    </form>
  );
}
