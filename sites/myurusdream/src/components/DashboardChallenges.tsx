"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatCents } from "@/lib/money";
import { POINTS } from "@/lib/constants";

type Person = { id: string; firstName: string; lastName: string; participantNumber?: number };

type ChallengeRow = {
  id: string;
  title: string;
  stake: string;
  endMode: "date" | "counter";
  endsAt: string | null;
  targetCents: number | null;
  status: string;
  videoUrl: string | null;
  createdAt: string;
  challenger: Person;
  challenged: Person;
  loser: Person | null;
  challengerPointsDuring: number;
  challengedPointsDuring: number;
};

function nameOf(p: Person) {
  const n = `${p.firstName} ${p.lastName}`.trim();
  return n || "Deelnemer";
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Wacht op antwoord";
    case "active":
      return "Bezig — wie deelt het meest?";
    case "awaiting_video":
      return "Verliezer uploadt filmpje";
    case "completed":
      return "Afgerond (+10 eerpunten)";
    case "declined":
      return "Geweigerd";
    case "cancelled":
      return "Geannuleerd";
    default:
      return status;
  }
}

export function DashboardChallenges({ preview = false }: { preview?: boolean }) {
  const [meId, setMeId] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [picked, setPicked] = useState<Person | null>(null);
  const [title, setTitle] = useState("Wie nodigt het meest uit?");
  const [stake, setStake] = useState("");
  const [endMode, setEndMode] = useState<"date" | "counter">("date");
  const [endsAt, setEndsAt] = useState("");
  const [endTime, setEndTime] = useState("20:00");
  const [targetEuro, setTargetEuro] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { challenges?: ChallengeRow[]; meId?: string };
      if (Array.isArray(data.challenges)) setChallenges(data.challenges);
      if (data.meId) setMeId(data.meId);
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 8000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/challenges/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = (await res.json()) as { results?: Person[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  async function createChallenge(e: FormEvent) {
    e.preventDefault();
    if (preview || !picked) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengedId: picked.id,
          title,
          stake,
          endMode,
          endsAt:
            endMode === "date" && endsAt
              ? new Date(`${endsAt}T${endTime || "20:00"}:00`).toISOString()
              : undefined,
          targetCents:
            endMode === "counter" && targetEuro
              ? Math.round(Number(targetEuro.replace(",", ".")) * 100)
              : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Mislukt");
      setMsg("Challenge verstuurd. Je vriend moet aanvaarden.");
      setStake("");
      setPicked(null);
      setQuery("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function act(id: string, action: "accept" | "decline") {
    if (preview) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Mislukt");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function uploadVideo(id: string, file: File | null) {
    if (preview || !file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("video", file);
      const res = await fetch(`/api/challenges/${id}/video`, { method: "POST", body: form });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Upload mislukt");
      setMsg(`Filmpje online. Jullie krijgen elk +${POINTS.challengeComplete} eerpunten.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-12 space-y-6">
      <div className="card-dark p-6">
        <p className="font-display text-sm tracking-[0.28em] text-yellow">VOOR DE EER</p>
        <h2 className="mt-3 font-display text-3xl">Punten &amp; challenges</h2>
        <p className="mt-3 max-w-3xl text-white/75">
          Als u uw persoonlijke link deelt en iemand stort via u, verdient u punten. Die punten zijn{" "}
          <span className="text-yellow">geen prijs</span> — puur voor de eer, zodat u ziet hoe
          populair uw link is in de ranking.
        </p>
        <p className="mt-3 max-w-3xl text-white/75">
          Maak er een challenge van: daag een vriend uit die ook al €2 stortte. Race tot een
          einddatum of tot de live teller een bedrag raakt. Wie minder deelt, verliest en moet een
          opdracht filmen. Als het filmpje online staat, krijgen beide +{POINTS.challengeComplete}{" "}
          eerpunten. Alle challenges blijven zichtbaar voor iedereen in het dashboard.
        </p>
      </div>

      {!preview ? (
        <div className="card-dark p-6">
          <h3 className="font-display text-2xl">Iemand uitdagen</h3>
          <p className="mt-2 text-sm text-white/60">
            Zoek op voornaam of achternaam van iemand die al gestort heeft.
          </p>
          <form onSubmit={createChallenge} className="mt-5 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted">Zoek vriend</label>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPicked(null);
                }}
                placeholder="Voornaam of achternaam"
                className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
              />
              {results.length ? (
                <ul className="mt-2 divide-y divide-white/10 border border-white/10">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-yellow/10"
                        onClick={() => {
                          setPicked(r);
                          setQuery(nameOf(r));
                          setResults([]);
                        }}
                      >
                        <span>{nameOf(r)}</span>
                        <span className="text-xs text-white/45">#{r.participantNumber}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {picked ? (
                <p className="mt-2 text-sm text-yellow">Gekozen: {nameOf(picked)}</p>
              ) : null}
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted">Titel race</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
                maxLength={120}
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted">
                Opdracht voor de verliezer
              </label>
              <textarea
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                rows={3}
                placeholder="Bv. dans in de keuken / bel je ouders / eet iets raars — en film het"
                className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
                maxLength={800}
                required
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={endMode === "date"}
                  onChange={() => setEndMode("date")}
                />
                Tot einddatum
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={endMode === "counter"}
                  onChange={() => setEndMode("counter")}
                />
                Tot tellerbedrag
              </label>
            </div>

            {endMode === "date" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted">
                    Einddatum (dag)
                  </label>
                  <input
                    type="date"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted">
                    Uur (wanneer die dag stopt)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
                    required
                  />
                  <p className="mt-1 text-xs text-white/45">Bv. 20:00 = ’s avonds om acht.</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs uppercase tracking-widest text-muted">
                  Teller bereikt (€)
                </label>
                <input
                  type="number"
                  min={1}
                  step="1"
                  value={targetEuro}
                  onChange={(e) => setTargetEuro(e.target.value)}
                  placeholder="Bv. 5000"
                  className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
                  required
                />
              </div>
            )}

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {msg ? <p className="text-sm text-yellow">{msg}</p> : null}

            <button type="submit" disabled={busy || !picked} className="btn-yellow disabled:opacity-50">
              {busy ? "Bezig…" : "Challenge versturen"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="card-dark p-6">
        <h3 className="font-display text-2xl">Alle challenges</h3>
        <p className="mt-2 text-sm text-white/60">
          Open voor iedereen in het dashboard. Zo blijft het leuk én zichtbaar.
        </p>
        {!challenges.length ? (
          <p className="mt-6 text-white/70">Nog geen challenges. Wees de eerste.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {challenges.map((c) => {
              const iAmChallenged = meId === c.challenged.id;
              const iAmLoser = meId === c.loser?.id;
              return (
                <li key={c.id} className="border border-white/10 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-xl text-yellow">{c.title}</p>
                    <p className="text-xs uppercase tracking-widest text-white/50">
                      {statusLabel(c.status)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    {nameOf(c.challenger)} <span className="text-white/40">vs</span>{" "}
                    {nameOf(c.challenged)}
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    Opdracht verliezer: {c.stake}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    {c.endMode === "date" && c.endsAt
                      ? `Tot ${new Date(c.endsAt).toLocaleString("nl-BE")}`
                      : c.targetCents != null
                        ? `Tot teller ${formatCents(c.targetCents)}`
                        : null}
                    {c.status === "active" || c.status === "awaiting_video" || c.status === "completed"
                      ? ` · Score tijdens race: ${c.challengerPointsDuring} – ${c.challengedPointsDuring}`
                      : null}
                  </p>
                  {c.loser ? (
                    <p className="mt-2 text-sm text-yellow">Verliezer: {nameOf(c.loser)}</p>
                  ) : null}

                  {!preview && c.status === "pending" && iAmChallenged ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        className="btn-yellow"
                        onClick={() => void act(c.id, "accept")}
                      >
                        Aanvaarden
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="btn-ghost"
                        onClick={() => void act(c.id, "decline")}
                      >
                        Weigeren
                      </button>
                    </div>
                  ) : null}

                  {!preview && c.status === "awaiting_video" && iAmLoser ? (
                    <div className="mt-4">
                      <label className="text-xs uppercase tracking-widest text-muted">
                        Upload uw filmpje (MP4/WebM, max 20 MB)
                      </label>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="mt-2 block w-full text-sm text-white/80"
                        disabled={busy}
                        onChange={(e) => void uploadVideo(c.id, e.target.files?.[0] ?? null)}
                      />
                    </div>
                  ) : null}

                  {c.videoUrl ? (
                    <div className="mt-4">
                      <video
                        src={c.videoUrl}
                        controls
                        className="max-h-64 w-full bg-black"
                        preload="metadata"
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {error && preview === false ? (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
