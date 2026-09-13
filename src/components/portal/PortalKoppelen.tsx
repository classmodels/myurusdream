"use client";

import { FormEvent, useState } from "react";

type Site = { slug: string; basePath: string };
type LinkRow = { email: string; site: string };

export function PortalKoppelen() {
  const [manageCode, setManageCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [liveSiteSlug, setLiveSiteSlug] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function rowsFromPayload(slots: Array<{ portalEmail?: string; liveSiteSlug?: string }>, extras: Array<{ portalEmail?: string; liveSiteSlug?: string }>) {
    return [...slots, ...extras]
      .filter((p) => p.portalEmail)
      .map((p) => ({ email: p.portalEmail || "", site: p.liveSiteSlug || "" }));
  }

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/preview-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manageCode, ...body }),
    });
    const data = (await res.json()) as {
      error?: string;
      sites?: Site[];
      slots?: Array<{ portalEmail?: string; liveSiteSlug?: string }>;
      extras?: Array<{ portalEmail?: string; liveSiteSlug?: string }>;
    };
    if (!res.ok) throw new Error(data.error || "Mislukt.");
    if (data.sites) setSites(data.sites);
    setLinks(rowsFromPayload(data.slots || [], data.extras || []));
    return data;
  }

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post({ action: "unlock" });
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({
        action: "link-client",
        email,
        password,
        liveSiteSlug,
      });
      setNotice("Gekoppeld. Die klant logt in op /portaal en ziet alleen deze site.");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <form onSubmit={(e) => void unlock(e)} className="mx-auto max-w-md rounded-xl border border-[#d7e3f2] bg-white p-6">
        <label className="block text-sm font-semibold text-ink-on-light">
          Beheercode
          <input
            className="input-field mt-1.5"
            value={manageCode}
            onChange={(e) => setManageCode(e.target.value)}
            placeholder="butler2026"
            autoComplete="off"
          />
        </label>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button type="submit" className="btn-primary mt-5 w-full text-sm" disabled={busy}>
          Openen
        </button>
        <p className="mt-3 text-xs text-muted-on-light">
          Dit is geen apart admin-account. De code is <strong className="text-ink-on-light">butler2026</strong>.
        </p>
      </form>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-8">
      <form onSubmit={(e) => void save(e)} className="rounded-xl border border-[#d7e3f2] bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-on-light">
          Klant aan een site koppelen
        </h2>
        <label className="mt-4 block text-sm font-semibold text-ink-on-light">
          E-mail van de klant
          <input
            type="email"
            required
            className="input-field mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="klant@bedrijf.be"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-ink-on-light">
          Wachtwoord voor die klant
          <input
            required
            className="input-field mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kies een wachtwoord"
          />
        </label>
        <label className="mt-4 block text-sm font-semibold text-ink-on-light">
          Welke site mag hij zien?
          <select
            required
            className="input-field mt-1.5"
            value={liveSiteSlug}
            onChange={(e) => setLiveSiteSlug(e.target.value)}
          >
            <option value="">Kies een site</option>
            {sites.map((site) => (
              <option key={site.slug} value={site.slug}>
                {site.slug} ({site.basePath})
              </option>
            ))}
          </select>
        </label>
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        {notice && <p className="mt-3 text-sm text-teal-deep">{notice}</p>}
        <button type="submit" className="btn-primary mt-5 text-sm" disabled={busy}>
          Koppelen
        </button>
      </form>

      {links.length > 0 && (
        <div className="rounded-xl border border-line bg-[#121a2b] p-5">
          <p className="text-xs font-bold tracking-wide text-teal uppercase">Gekoppelde klanten</p>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {links.map((row) => (
              <li key={row.email}>
                {row.email} → {row.site || "geen site"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
