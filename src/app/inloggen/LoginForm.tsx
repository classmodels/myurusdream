"use client";

import { useState } from "react";

export function LoginForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const email = String(new FormData(e.currentTarget).get("email"));
    const res = await fetch("/api/auth/magic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setBusy(false);
    setMessage(data.message || data.error);
    setLink(data.localLink || null);
  }

  return (
    <form onSubmit={onSubmit} className="card-dark space-y-4 p-8">
      <label htmlFor="email">E-mail van uw bijdrage</label>
      <input id="email" name="email" type="email" required />
      <button className="btn-yellow w-full" disabled={busy}>
        Stuur toegangslink
      </button>
      {message ? <p className="text-sm text-white/70">{message}</p> : null}
      {link ? (
        <a href={link} className="block text-sm text-yellow underline">
          Lokale toegangslink (geen e-mailserver)
        </a>
      ) : null}
    </form>
  );
}
