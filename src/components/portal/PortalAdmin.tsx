"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearClientSiteSession, saveClientSiteSession } from "@/lib/client-site-session";
import { setPortalSession, type PortalState } from "@/lib/portal";
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
  openChangeRequests: number;
  files: number;
  comments: number;
  hasNewActivity: boolean;
};

type Site = { slug: string; basePath: string };

type DetailPayload = {
  record?: {
    portal?: Partial<PortalState> | null;
    adminMessages?: Array<{ id: string; text: string; createdAt: string; read: boolean }>;
    lastLoginAt?: string | null;
    liveSiteSlug?: string;
  } | null;
  catalog?: {
    title?: string;
    liveSiteSlug?: string;
    slug?: string;
    portalPassword?: string;
    portalEmail?: string;
  } | null;
  liveSitePath?: string;
};

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
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

  const [view, setView] = useState<"cards" | "create" | "detail">("cards");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [liveSiteSlug, setLiveSiteSlug] = useState("");

  const [detailTitle, setDetailTitle] = useState("");
  const [detailPassword, setDetailPassword] = useState("");
  const [detailSite, setDetailSite] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [detail, setDetail] = useState<DetailPayload | null>(null);

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
      } & DetailPayload;
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
      setView("cards");
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
        liveSiteSlug: liveSiteSlug || undefined,
        title: title || undefined,
      });
      setNotice(`Account aangemaakt voor ${email.trim().toLowerCase()}.`);
      setPassword("");
      setEmail("");
      setTitle("");
      setLiveSiteSlug("");
      setView("cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function openDetail(clientEmail: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await post({ action: "get-client", email: clientEmail });
      setSelectedEmail(clientEmail);
      setDetail(data);
      setDetailTitle(data.catalog?.title || clientEmail);
      setDetailPassword(data.catalog?.portalPassword || "");
      setDetailSite(data.catalog?.liveSiteSlug || "");
      setShowPassword(false);
      setMessageText("");
      setView("detail");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDetail(e: FormEvent) {
    e.preventDefault();
    if (!selectedEmail) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({
        action: "update-client",
        email: selectedEmail,
        title: detailTitle,
        password: detailPassword,
        liveSiteSlug: detailSite || null,
      });
      setNotice("Gegevens opgeslagen.");
      await openDetail(selectedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function unlinkSite() {
    if (!selectedEmail) return;
    setBusy(true);
    setError("");
    try {
      await post({ action: "unlink-site", email: selectedEmail });
      setDetailSite("");
      setNotice("Site ontkoppeld.");
      await openDetail(selectedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!selectedEmail) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await post({ action: "send-message", email: selectedEmail, message: messageText });
      setNotice("Boodschap verzonden — de klant ziet die in het portaal.");
      setMessageText("");
      await openDetail(selectedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function openAsAdmin() {
    if (!selectedEmail) return;
    setBusy(true);
    setError("");
    try {
      const data = await post({ action: "get-client", email: selectedEmail });
      const livePath = data.liveSitePath || "";
      setAdminSession(true, manageCode);
      setAdminViewClient(selectedEmail);
      setPortalSession(selectedEmail);
      if (livePath) {
        saveClientSiteSession({
          slug: data.catalog?.slug || selectedEmail,
          publicSlug: data.catalog?.liveSiteSlug || data.catalog?.slug || selectedEmail,
          liveSitePath: livePath,
          title: data.catalog?.title || selectedEmail,
          previewUrl: "",
          progress: 10,
          accessCode: "",
        });
      } else {
        clearClientSiteSession();
      }
      router.push(`/portaal/project?admin=${encodeURIComponent(selectedEmail)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt.");
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-teal uppercase">Backstage</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
            {view === "cards" && "Klantkaarten"}
            {view === "create" && "Nieuw klantaccount"}
            {view === "detail" && (detailTitle || selectedEmail)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {view !== "cards" && (
            <button
              type="button"
              className="btn-ghost !px-3 !py-2 text-xs"
              onClick={() => {
                setView("cards");
                setSelectedEmail(null);
                setDetail(null);
                setError("");
                setNotice("");
              }}
            >
              ← Alle kaarten
            </button>
          )}
          {view === "cards" && (
            <button
              type="button"
              className="btn-primary !px-4 !py-2 text-xs"
              onClick={() => {
                setView("create");
                setError("");
                setNotice("");
              }}
            >
              + Account aanmaken
            </button>
          )}
          <Link href="/portaal" className="btn-ghost !px-3 !py-2 text-xs">
            Portaal-login
          </Link>
        </div>
      </div>

      {error && <p className="rounded-lg bg-coral/15 px-3 py-2 text-sm text-coral">{error}</p>}
      {notice && <p className="rounded-lg bg-teal/15 px-3 py-2 text-sm text-teal">{notice}</p>}

      {view === "cards" && (
        <div>
          {clients.length === 0 ? (
            <p className="text-sm text-ink-soft">Nog geen klantaccounts. Maak er een aan.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {clients.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  disabled={busy}
                  onClick={() => void openDetail(c.email)}
                  className="relative rounded-xl border border-line bg-[#121a2b] p-4 text-left transition hover:border-teal/50"
                >
                  {c.hasNewActivity && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-coral px-2 py-0.5 text-[0.65rem] font-bold text-white">
                      Nieuw
                    </span>
                  )}
                  {c.openChangeRequests > 0 && !c.hasNewActivity && (
                    <span className="absolute top-3 right-3 inline-flex rounded-full bg-teal px-2 py-0.5 text-[0.65rem] font-bold text-white">
                      {c.openChangeRequests} open
                    </span>
                  )}
                  <p className="pr-14 font-[family-name:var(--font-display)] text-lg font-bold text-ink">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">{c.email}</p>
                  <p className="mt-2 text-xs text-teal">
                    Site: {c.liveSiteSlug ? c.liveSiteSlug : "niet gekoppeld"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">Laatst inloggen: {formatWhen(c.lastLoginAt)}</p>
                  <p className="mt-2 text-[0.7rem] text-ink-soft">
                    {c.changeRequests} aanvragen · {c.files} foto&apos;s · {c.comments} teksten
                    {c.unreadForClient > 0 ? ` · ${c.unreadForClient} berichten ongelezen` : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <form
          onSubmit={(e) => void createClient(e)}
          className="rounded-xl border border-line bg-[#121a2b] p-5 md:p-6"
        >
          <p className="text-sm text-ink-soft">
            Maak een login voor de klant. Site koppelen kan nu of later in het klantendossier.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              E-mail *
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
              Wachtwoord *
              <input
                required
                type="password"
                minLength={4}
                className="input-field mt-1.5 !bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 4 tekens"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Weergavenaam
              <input
                className="input-field mt-1.5 !bg-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bv. Zetor Museum"
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Site koppelen (optioneel)
              <select
                className="input-field mt-1.5 !bg-white"
                value={liveSiteSlug}
                onChange={(e) => setLiveSiteSlug(e.target.value)}
              >
                <option value="">Later koppelen…</option>
                {sites.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.slug} ({s.basePath || `/portaal/${s.slug}`})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="btn-primary mt-5 text-sm" disabled={busy}>
            Account aanmaken
          </button>
        </form>
      )}

      {view === "detail" && selectedEmail && detail && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary !px-4 !py-2 text-xs" disabled={busy} onClick={() => void openAsAdmin()}>
              Open klantportaal als admin
            </button>
            {detail.liveSitePath ? (
              <a href={detail.liveSitePath} target="_blank" rel="noreferrer" className="btn-soft !px-4 !py-2 text-xs">
                Open gekoppelde site
              </a>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <form
              onSubmit={(e) => void saveDetail(e)}
              className="rounded-xl border border-line bg-[#121a2b] p-5"
            >
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">Account beheren</p>
              <label className="mt-4 block text-sm font-semibold text-ink">
                Weergavenaam
                <input
                  className="input-field mt-1.5 !bg-white"
                  value={detailTitle}
                  onChange={(e) => setDetailTitle(e.target.value)}
                />
              </label>
              <label className="mt-3 block text-sm font-semibold text-ink">
                E-mail
                <input className="input-field mt-1.5 !bg-white/80" value={selectedEmail} readOnly />
              </label>
              <label className="mt-3 block text-sm font-semibold text-ink">
                Wachtwoord
                <div className="mt-1.5 flex gap-2">
                  <input
                    className="input-field !bg-white"
                    type={showPassword ? "text" : "password"}
                    value={detailPassword}
                    onChange={(e) => setDetailPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-soft !px-3 !py-2 text-xs"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Verberg" : "Toon"}
                  </button>
                </div>
              </label>
              <label className="mt-3 block text-sm font-semibold text-ink">
                Gekoppelde site
                <select
                  className="input-field mt-1.5 !bg-white"
                  value={detailSite}
                  onChange={(e) => setDetailSite(e.target.value)}
                >
                  <option value="">Niet gekoppeld</option>
                  {sites.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.slug}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="submit" className="btn-primary text-sm" disabled={busy}>
                  Opslaan
                </button>
                {detailSite ? (
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    disabled={busy}
                    onClick={() => void unlinkSite()}
                  >
                    Site ontkoppelen
                  </button>
                ) : null}
              </div>
              <p className="mt-3 text-xs text-ink-soft">
                Laatst ingelogd: {formatWhen(detail.record?.lastLoginAt)}
              </p>
            </form>

            <form
              onSubmit={(e) => void sendMessage(e)}
              className="rounded-xl border border-line bg-[#121a2b] p-5"
            >
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">
                Boodschap naar deze klant
              </p>
              <textarea
                required
                rows={5}
                className="input-field mt-4 !bg-white"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="De klant ziet dit in het portaal…"
              />
              <button type="submit" className="btn-primary mt-3 text-sm" disabled={busy}>
                Versturen
              </button>
              <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto">
                {(detail.record?.adminMessages || []).length === 0 && (
                  <li className="text-xs text-ink-soft">Nog geen berichten.</li>
                )}
                {(detail.record?.adminMessages || []).map((m) => (
                  <li key={m.id} className="rounded-md bg-white/5 px-3 py-2 text-sm text-ink">
                    {m.text}
                    <span className="mt-1 block text-[0.65rem] text-ink-soft">
                      {formatWhen(m.createdAt)}
                      {m.read ? " · gelezen" : " · ongelezen"}
                    </span>
                  </li>
                ))}
              </ul>
            </form>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-[#121a2b] p-4">
              <p className="text-xs font-bold text-ink-soft uppercase">Veranderingsaanvragen</p>
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-sm">
                {(detail.record?.portal?.changeRequests || []).length === 0 && (
                  <li className="text-ink-soft">Geen aanvragen.</li>
                )}
                {(detail.record?.portal?.changeRequests || []).map((r) => (
                  <li key={r.id} className="rounded-md bg-white/5 px-3 py-2">
                    <span className="font-semibold text-ink">{r.title}</span>
                    <span className="ml-2 text-xs text-teal">{r.status}</span>
                    <p className="mt-1 text-xs text-ink-soft">{r.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-[#121a2b] p-4">
              <p className="text-xs font-bold text-ink-soft uppercase">Uploads / foto&apos;s</p>
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-sm">
                {(detail.record?.portal?.files || []).length === 0 && (
                  <li className="text-ink-soft">Geen bestanden.</li>
                )}
                {(detail.record?.portal?.files || []).map((f) => (
                  <li key={f.id} className="rounded-md bg-white/5 px-3 py-2 text-ink">
                    {f.name} <span className="text-xs text-ink-soft">({f.sizeLabel})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-[#121a2b] p-4">
              <p className="text-xs font-bold text-ink-soft uppercase">Teksten / comments</p>
              <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-sm">
                {(detail.record?.portal?.comments || []).length === 0 && (
                  <li className="text-ink-soft">Geen teksten.</li>
                )}
                {(detail.record?.portal?.comments || []).map((c) => (
                  <li key={c.id} className="rounded-md bg-white/5 px-3 py-2 text-ink-soft">
                    {c.text}
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
