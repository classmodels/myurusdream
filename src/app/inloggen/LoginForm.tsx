"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/client";

export function LoginForm() {
  const dict = useDict();
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
      setMessage(data.error || dict.common.error);
      return;
    }
    window.location.href = data.redirect || "/dashboard";
  }

  return (
    <form onSubmit={onSubmit} className="card-dark space-y-4 p-8">
      <label htmlFor="email">{dict.meedoen.email}</label>
      <input id="email" name="email" type="email" required autoComplete="email" />
      <label htmlFor="phone">{dict.meedoen.phone}</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        required
        autoComplete="tel"
        inputMode="tel"
      />
      <button className="btn-yellow w-full" disabled={busy}>
        {busy ? dict.common.loading : dict.inloggen.submit}
      </button>
      {message ? <p className="text-sm text-white/70">{message}</p> : null}
    </form>
  );
}
