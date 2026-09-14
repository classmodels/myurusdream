"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveClientSiteSession } from "@/lib/client-site-session";
import {
  createDefaultPortalState,
  setPortalSession,
  type PortalState,
} from "@/lib/portal";
import {
  getAdminManageCode,
  setAdminSession,
  setAdminViewClient,
} from "@/lib/portal-admin-session";

type ClientCard = {
  email: string;
  slug: string;
  title: string;
  liveSiteSlug: string;
  liveSitePath: string;
  lastLoginAt: string | null;
  updatedAt: string;
  hasPassword: boolean;
  published: boolean;
  messageCount: number;
  unreadForClient: number;
  changeRequests: number;
  files: number;
  comments: number;
};

type Site = { slug: string; basePath: string };

function formatWhen(iso: string | null) {
  if (!iso) return "Nog niet ingelogd";
  try {
    return new Date(iso).toLocaleString("nl-BE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PortalAdmin() {
  const router = useRouter();
  const [manageCode, setManageCode] = useState(() => getAdminManageCode() || "");
  const [unlocked, setUnlocked] = useState(false);
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [liveSiteSlug, setLiveSiteSlug] = useState("");

  const [messageEmail, setMessageEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [detailEmail, setDetailEmail] = useState<string | null>(null);
  const [detailPortal, setDetailPortal] = useState<Partial<PortalState> | null>(null);
  const [detailMessages, setDetailMessages] = useState<
    Array<{ id: string; text: string; createdAt: string; read: boolean }>
  >([]);

  const post = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch("/api/portal-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manageCode, ...body }),
      });
      const data = (await res.json()) as {
        error?: string;
        clients?: ClientCard[];
        sites?: Site[];
        record?: {
          portal?: Partial<PortalState> | null;
          adminMessages?: Array<{ id: string; text: string; createdAt: string; read: boolean }>;
          lastLoginAt?: string | null;
        };
        catalog?: { title?: string; liveSiteSlug?: string; slug?: string } | null;
        liveSitePath?: string;
      };
      if (!res.ok) throw new Error(data.error || "Mislukt.");
      if (data.clients) setClients(data.clients);
      if (data.sites) setSites(data.sites);
      return data;
    },
    [manageCode],
  );

  useEffect(() => {
    const code = getAdminManageCode();
    if (!code) return;
    setManageCode(code);
    void (async () => {
      try {
        setBusy(true);
        const res = await fetch("/api/portal-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manageCode: code, action: "list" }),
        });
        const data = (await res.json()) as {
          error?: string;
          clients?: ClientCard[];
          sites?: Site[];
        };
        if (!res.ok) throw new Error(data.error || "Mislukt.");
        if (data.clients) setClients(data.clients);
        if (data.sites) setSites(data.sites);
        setAdminSession(true, code);
        setUnlocked(true);
      } catch {
        /* stay locked */
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post({ action: "unlock" });
      setAdminSession(true, manageCode);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function createClient(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({
        action: "create-client",
        email,
        password,
        liveSiteSlug,
        title: title || undefined,
      });
      setNotice(`Account aangemaakt voor ${email.trim().toLowerCase()}.`);
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function openClient(client: ClientCard) {
    setBusy(true);
    setError("");
    try {
      const data = await post({ action: "get-client", email: client.email });
      const livePath =
        data.liveSitePath ||
        client.liveSitePath ||
        (client.liveSiteSlug ? `/portaal/${client.liveSiteSlug}` : "");
      setAdminSession(true, manageCode);
      setAdminViewClient(client.email);
      setPortalSession(client.email);
      saveClientSiteSession({
        slug: data.catalog?.slug || client.slug,
        publicSlug: client.liveSiteSlug || client.slug,
        liveSitePath: livePath,
        title: data.catalog?.title || client.title,
        previewUrl: "",
        progress: 10,
        accessCode: "",
      });
      router.push(`/portaal/project?admin=${encodeURIComponent(client.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function loadDetail(emailAddr: string) {
    setDetailEmail(emailAddr);
    setMessageEmail(emailAddr);
    setBusy(true);
    setError("");
    try {
      const data = await post({ action: "get-client", email: emailAddr });
      setDetailPortal(data.record?.portal || null);
      setDetailMessages(data.record?.adminMessages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({
        action: "send-message",
        email: messageEmail,
        message: messageText,
      });
      setNotice("Boodschap verzonden — de klant ziet die in het portaal.");
      setMessageText("");
      if (detailEmail === messageEmail) await loadDetail(messageEmail);
      await post({ action: "list" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <form
        onSubmit={(e) => void unlock(e)}
        className="mx-auto max-w-md rounded-xl border border-line bg-[#121a2b] p-6"
      >
        <p className="text-xs font-bold tracking-wide text-teal uppercase">Administrator</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          Backstage ontgrendelen
        </h2>
        <label className="mt-5 block text-sm font-semibold text-ink">
          Beheercode
          <input
            className="input-field mt-1.5 !bg-white"
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
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-teal uppercase">Backstage</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            Klanten &amp; sites
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Maak accounts, koppel sites, open het klantportaal als admin, stuur berichten.
          </p>
        </div>
        <Link href="/portaal" className="btn-ghost !px-3 !py-2 text-xs">
          Naar portaal-login
        </Link>
      </div>

      {error && <p className="rounded-lg bg-coral/15 px-3 py-2 text-sm text-coral">{error}</p>}
      {notice && <p className="rounded-lg bg-teal/15 px-3 py-2 text-sm text-teal">{notice}</p>}

      <form
        onSubmit={(e) => void createClient(e)}
        className="rounded-xl border border-line bg-[#121a2b] p-5 md:p-6"
      >
        <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">Nieuw klantaccount</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">
            E-mail
            <input
              required
              type="email"
              className="input-field mt-1.5 !bg-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="klant@bedrijf.be"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Wachtwoord
            <input
              required
              type="password"
              className="input-field mt-1.5 !bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 tekens"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Weergavenaam
            <input
              className="input-field mt-1.5 !bg-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bv. Myurusdream"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Gekoppelde site
            <select
              required
              className="input-field mt-1.5 !bg-white"
              value={liveSiteSlug}
              onChange={(e) => setLiveSiteSlug(e.target.value)}
            >
              <option value="">Kies site…</option>
              {sites.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.slug} ({s.basePath || `/portaal/${s.slug}`})
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="btn-primary mt-4 text-sm" disabled={busy}>
          Account aanmaken &amp; site koppelen
        </button>
      </form>

      <div>
        <p className="mb-3 text-xs font-bold tracking-wide text-ink-soft uppercase">
          Klantkaarten ({clients.length})
        </p>
        {clients.length === 0 ? (
          <p className="text-sm text-ink-soft">Nog geen klantaccounts. Maak er hierboven een aan.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => (
              <article
                key={c.email}
                className="flex flex-col rounded-xl border border-line bg-[#121a2b] p-4 transition hover:border-teal/50"
              >
                <button
                  type="button"
                  className="text-left"
                  onClick={() => void openClient(c)}
                >
                  <p className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{c.email}</p>
                  <p className="mt-2 text-xs text-teal">
                    Site: {c.liveSiteSlug || "niet gekoppeld"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">Laatst inloggen: {formatWhen(c.lastLoginAt)}</p>
                  <p className="mt-2 text-[0.7rem] text-ink-soft">
                    {c.changeRequests} aanvragen · {c.files} foto&apos;s · {c.comments} teksten ·{" "}
                    {c.unreadForClient} open berichten
                  </p>
                </button>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                  <button
                    type="button"
                    className="btn-primary !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void openClient(c)}
                  >
                    Open als admin
                  </button>
                  <button
                    type="button"
                    className="btn-soft !px-3 !py-1.5 text-xs"
                    disabled={busy}
                    onClick={() => void loadDetail(c.email)}
                  >
                    Overzicht
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => void sendMessage(e)}
        className="rounded-xl border border-line bg-[#121a2b] p-5"
      >
        <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">Boodschap naar klant</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_2fr]">
          <label className="block text-sm font-semibold text-ink">
            Klant
            <select
              required
              className="input-field mt-1.5 !bg-white"
              value={messageEmail}
              onChange={(e) => setMessageEmail(e.target.value)}
            >
              <option value="">Kies…</option>
              {clients.map((c) => (
                <option key={c.email} value={c.email}>
                  {c.title} ({c.email})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">
            Bericht
            <textarea
              required
              rows={3}
              className="input-field mt-1.5 !bg-white"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="De klant ziet dit in het portaal…"
            />
          </label>
        </div>
        <button type="submit" className="btn-primary mt-4 text-sm" disabled={busy}>
          Versturen
        </button>
      </form>

      {detailEmail && (
        <div className="rounded-xl border border-line bg-[#121a2b] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold tracking-wide text-teal uppercase">
              Overzicht · {detailEmail}
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-ink-soft underline"
              onClick={() => {
                setDetailEmail(null);
                setDetailPortal(null);
                setDetailMessages([]);
              }}
            >
              Sluiten
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-ink-soft uppercase">Veranderingsaanvragen</p>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                {(detailPortal?.changeRequests || []).length === 0 && (
                  <li className="text-ink-soft">Geen aanvragen.</li>
                )}
                {(detailPortal?.changeRequests || []).map((r) => (
                  <li key={r.id} className="rounded-md bg-white/5 px-3 py-2">
                    <span className="font-semibold text-ink">{r.title}</span>
                    <span className="ml-2 text-xs text-teal">{r.status}</span>
                    <p className="mt-1 text-xs text-ink-soft">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-soft uppercase">Uploads</p>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                {(detailPortal?.files || []).length === 0 && (
                  <li className="text-ink-soft">Geen bestanden.</li>
                )}
                {(detailPortal?.files || []).map((f) => (
                  <li key={f.id} className="rounded-md bg-white/5 px-3 py-2 text-ink">
                    {f.name}{" "}
                    <span className="text-xs text-ink-soft">({f.sizeLabel})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-soft uppercase">Teksten / comments</p>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                {(detailPortal?.comments || []).length === 0 && (
                  <li className="text-ink-soft">Geen teksten.</li>
                )}
                {(detailPortal?.comments || []).map((c) => (
                  <li key={c.id} className="rounded-md bg-white/5 px-3 py-2 text-ink-soft">
                    {c.text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-soft uppercase">Berichten van admin</p>
              <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm">
                {detailMessages.length === 0 && <li className="text-ink-soft">Nog geen berichten.</li>}
                {detailMessages.map((m) => (
                  <li key={m.id} className="rounded-md bg-white/5 px-3 py-2">
                    <p className="text-ink">{m.text}</p>
                    <p className="mt-1 text-[0.65rem] text-ink-soft">
                      {formatWhen(m.createdAt)}
                      {m.read ? " · gelezen" : " · ongelezen"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
