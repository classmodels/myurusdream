"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Login mislukt");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card-dark space-y-4 p-8">
      <div>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue="admin@droomop2.local"
          className="mt-2"
        />
      </div>
      <div>
        <label htmlFor="password">Wachtwoord</label>
        <input id="password" name="password" type="password" className="mt-2" />
      </div>
      {error ? <p className="text-sm text-yellow">{error}</p> : null}
      <button className="btn-yellow w-full">Inloggen</button>
    </form>
  );
}
