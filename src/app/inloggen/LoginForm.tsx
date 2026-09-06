"use client";

import { useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email")),
        phone: String(form.get("phone")),
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Inloggen mislukt.");
      return;
    }
    window.location.href = data.redirect || "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="card-dark space-y-4 p-8">
      <label htmlFor="email">E-mail van uw bijdrage</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="phone">GSM-nummer van uw bijdrage</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
      />
      <button className="btn-yellow w-full" disabled={busy}>
        {busy ? "Even geduld…" : "Open dashboard"}
      </button>
      {message ? <p className="text-sm text-white/70">{message}</p> : null}
    </form>
  );
}
