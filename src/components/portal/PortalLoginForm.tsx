"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  PORTAL_DEMO,
  createDefaultPortalState,
  loadPortalState,
  savePortalState,
  setPortalSession,
} from "@/lib/portal";

export function PortalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>(PORTAL_DEMO.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const ok =
      email.trim().toLowerCase() === PORTAL_DEMO.email &&
      password === PORTAL_DEMO.password;
    if (!ok) {
      setError("Onjuiste login. Gebruik de demo-gegevens onder het formulier.");
      return;
    }
    setPortalSession(email.trim().toLowerCase());
    const existing = loadPortalState();
    if (!existing || existing.email !== PORTAL_DEMO.email) {
      savePortalState(createDefaultPortalState(PORTAL_DEMO.email));
    }
    router.push("/portaal/project");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[#d7e3f2] bg-white p-6 shadow-[0_16px_36px_rgba(0,0,0,0.22)] md:p-8">
      <label className="block text-sm font-semibold text-ink-on-light">
        E-mail
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field mt-1.5"
          autoComplete="username"
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
      <button type="submit" className="btn-primary mt-6 w-full text-sm">
        Inloggen
      </button>
      <p className="mt-4 rounded-lg bg-[#f4f7fb] px-3 py-2 text-xs text-muted-on-light">
        Demo: <strong className="text-ink-on-light">{PORTAL_DEMO.email}</strong> /{" "}
        <strong className="text-ink-on-light">{PORTAL_DEMO.password}</strong>
      </p>
    </form>
  );
}
