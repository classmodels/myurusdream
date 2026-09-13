"use client";

import { useEffect, useMemo, useState } from "react";
import { hasMockSite, isPublicPreview, type PreviewFeedback, type PreviewPublic } from "@/lib/preview-model";
import { TestSiteMock } from "@/components/TestSiteMock";

export function PreviewRoom({
  slug,
  title,
  initialCode,
}: {
  slug: string;
  title: string;
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode || "");
  const [naam, setNaam] = useState("");
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [project, setProject] = useState<PreviewPublic | null>(null);
  const [feedback, setFeedback] = useState<PreviewFeedback[]>([]);

  const live = useMemo(() => (project ? isPublicPreview(project.previewUrl) : false), [project]);

  async function call(action: "unlock" | "feedback", overrideCode?: string) {
    const used = (overrideCode ?? code).trim();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          slug,
          accessCode: used,
          naam,
          score,
          comment,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        project?: PreviewPublic;
        feedback?: PreviewFeedback[];
      };
      if (!res.ok) {
        setError(data.error || "Mislukt.");
        return;
      }
      if (data.project) setProject(data.project);
      if (data.feedback) setFeedback(data.feedback);
      if (action === "feedback") {
        setComment("");
        setNotice("Bedankt. Uw beoordeling is bewaard.");
      }
    } catch {
      setError("Geen verbinding. Probeer opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!initialCode?.trim()) return;
    void call("unlock", initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, slug]);

  if (!project) {
    return (
      <div className="card mx-auto max-w-md p-6">
        <h2 className="text-xl font-bold text-ink-on-light">Toegang tot {title}</h2>
        <p className="mt-2 text-sm text-muted-on-light">
          Deze preview is niet openbaar. Vul de code in die u van SiteButler kreeg.
        </p>
        <label className="label mt-5" htmlFor="preview-code">
          Toegangscode
        </label>
        <input
          id="preview-code"
          className="input-field"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void call("unlock");
          }}
          autoComplete="off"
        />
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button
          type="button"
          className="btn-primary mt-4 w-full text-sm"
          disabled={busy || !code.trim()}
          onClick={() => void call("unlock")}
        >
          Preview openen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{project.clientLabel}</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
            {project.title}
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">{project.summary}</p>
        </div>
        <p className="text-sm font-bold text-teal">{project.progress}% afgewerkt</p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-teal" style={{ width: `${project.progress}%` }} />
      </div>

      {live ? (
        <div className="overflow-hidden rounded-tr-2xl ring-1 ring-line">
          <div className="flex items-center justify-between gap-3 bg-[#121a2b] px-4 py-3">
            <p className="text-xs font-bold tracking-wide text-teal uppercase">De website</p>
            <a
              href={project.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-blue hover:underline"
            >
              Open in nieuw tabblad →
            </a>
          </div>
          <iframe title={project.title} src={project.previewUrl} className="h-[78vh] w-full bg-white" />
        </div>
      ) : null}

      {!live && hasMockSite(project) ? <TestSiteMock project={project} /> : null}

      {live || hasMockSite(project) ? null : (
        <div className="rounded-tr-2xl border border-line bg-[#121a2b] p-6">
          <p className="text-xs font-bold tracking-wide text-teal uppercase">Nog op localhost</p>
          <h2 className="mt-2 text-xl font-bold text-ink">Deze site is nog niet publiek bereikbaar</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            De ontwikkeling draait op de computer van SiteButler (<span className="text-ink">localhost</span>
            ). Uw browser kan die niet openen — die zoekt dan op <em>uw</em> computer. Zodra er een
            testdomein of preview-link is, verschijnt de echte site hier in beeld.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            U kunt wél de voortgang en notities hieronder volgen, en al een beoordeling geven.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">Wat er al in zit</p>
          <ul className="mt-3 space-y-2">
            {project.changelog.map((row) => (
              <li key={row.date + row.text} className="text-sm text-ink-on-light">
                <span className="font-bold text-teal-deep">{row.date}:</span> {row.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">Beoordeling</p>
          <p className="mt-2 text-sm text-muted-on-light">
            Wat vindt u van de richting tot nu toe? SiteButler leest dit mee.
          </p>
          <label className="label mt-4" htmlFor="fb-naam">
            Uw naam
          </label>
          <input id="fb-naam" className="input-field" value={naam} onChange={(e) => setNaam(e.target.value)} />
          <p className="label mt-4">Score</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`h-10 w-10 rounded-md text-sm font-bold ${
                  score === n ? "bg-blue text-white" : "border border-[#cdd8e8] text-ink-on-light"
                }`}
                onClick={() => setScore(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <label className="label mt-4" htmlFor="fb-comment">
            Opmerking
          </label>
          <textarea
            id="fb-comment"
            className="input-field min-h-28 resize-y"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Wat is al goed? Wat moet anders?"
          />
          {error && <p className="mt-3 text-sm text-coral">{error}</p>}
          {notice && <p className="mt-3 text-sm text-teal-deep">{notice}</p>}
          <button
            type="button"
            className="btn-primary mt-4 text-sm"
            disabled={busy}
            onClick={() => void call("feedback")}
          >
            Beoordeling versturen
          </button>
        </div>
      </div>

      {feedback.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Eerdere feedback</h2>
          <div className="mt-4 grid gap-3">
            {feedback.map((f) => (
              <blockquote key={f.id} className="card p-5">
                <p className="text-sm font-bold text-blue-deep">
                  {f.score}/5 · {f.naam}
                </p>
                <p className="mt-2 text-sm text-ink-on-light">{f.comment}</p>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
