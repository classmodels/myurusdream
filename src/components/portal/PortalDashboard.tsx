"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  PORTAL_DEMO,
  careTimeBreakdown,
  clearPortalSession,
  createDefaultPortalState,
  elapsedToBillableMinutes,
  formatBytes,
  formatTimerClock,
  getPortalSession,
  loadPortalState,
  nextOpenStep,
  portalSteps,
  progressPercent,
  savePortalState,
  stepStatus,
  type ChangeRequest,
  type PortalComment,
  type PortalFile,
  type PortalState,
  type PortalStepId,
  type TimeEntry,
} from "@/lib/portal";

function StatusDot({ status }: { status: ReturnType<typeof stepStatus> }) {
  const map = {
    done: "bg-green",
    current: "bg-blue ring-4 ring-blue/25",
    waiting: "bg-teal",
    upcoming: "bg-white/20",
  } as const;
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[status]}`} />;
}

function SignaturePad({
  onChange,
}: {
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function pos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end() {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-32 w-full touch-none rounded-lg border border-[#cdd8e8] bg-white"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <button type="button" onClick={clear} className="mt-2 text-xs font-semibold text-muted-on-light hover:text-ink-on-light">
        Wis handtekening
      </button>
    </div>
  );
}

export function PortalDashboard() {
  const [state, setState] = useState<PortalState | null>(null);
  const [ready, setReady] = useState(false);
  const [comment, setComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [reqTitle, setReqTitle] = useState("");
  const [reqDetail, setReqDetail] = useState("");
  const [logMinutes, setLogMinutes] = useState(15);
  const [logLabel, setLogLabel] = useState("");
  const [logRequestId, setLogRequestId] = useState("");
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const session = getPortalSession();
    if (!session) {
      window.location.href = "/portaal";
      return;
    }
    const saved = loadPortalState();
    const initial: PortalState =
      saved && saved.email === session
        ? {
            ...saved,
            activeStep: saved.activeStep || nextOpenStep(saved),
          }
        : createDefaultPortalState(session);
    setState(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (state) savePortalState(state);
  }, [state]);

  useEffect(() => {
    if (!previewFullscreen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPreviewFullscreen(false);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [previewFullscreen]);

  useEffect(() => {
    if (!state?.activeTimer) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [state?.activeTimer]);

  if (!ready || !state) {
    return (
      <div className="container-x py-20 text-sm text-ink-soft">Portaal laden…</div>
    );
  }

  const pct = progressPercent(state);
  /** Linkerkolom toont nooit feedback — tijdens feedback blijft ontwerp zichtbaar */
  const leftStepId = state.activeStep === "feedback" ? "ontwerp" : state.activeStep;
  const leftActive = portalSteps.find((s) => s.id === leftStepId)!;
  const care = careTimeBreakdown(state);
  const includedExhausted = care.includedLeft === 0;

  function update(patch: Partial<PortalState>) {
    setState((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function completeStep(id: PortalStepId) {
    setState((prev) => {
      if (!prev) return prev;
      const completed: PortalStepId[] = prev.completedSteps.includes(id)
        ? prev.completedSteps
        : [...prev.completedSteps, id];
      const next = { ...prev, completedSteps: completed };
      return { ...next, activeStep: nextOpenStep(next) };
    });
  }

  function addComment(
    author: "client" | "builder",
    text: string,
    name: string,
    parentId: string | null = null,
  ) {
    if (!text.trim()) return;
    const item: PortalComment = {
      id: crypto.randomUUID(),
      author,
      name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      parentId,
    };
    setState((prev) =>
      prev
        ? { ...prev, comments: [...(prev.comments ?? []), item] }
        : prev,
    );
  }

  function resetPortal() {
    if (!state) return;
    if (
      !window.confirm(
        "Demo volledig resetten? Alle stappen, uploads, feedback en aanvragen gaan terug naar begin.",
      )
    ) {
      return;
    }
    const fresh = createDefaultPortalState(state.email);
    setState(fresh);
    setComment("");
    setReplyToId(null);
    setReplyText("");
    setReqTitle("");
    setReqDetail("");
    setLogMinutes(15);
    setLogLabel("");
    setLogRequestId("");
    setPreviewFullscreen(false);
  }

  function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const added: PortalFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      kind: f.type || "bestand",
      sizeLabel: formatBytes(f.size),
      uploadedAt: new Date().toISOString(),
    }));
    setState((prev) => (prev ? { ...prev, files: [...prev.files, ...added] } : prev));
  }

  function logout() {
    clearPortalSession();
    window.location.href = "/portaal";
  }

  function addChangeRequest() {
    if (!reqTitle.trim() || !reqDetail.trim() || !state) return;
    const now = new Date().toISOString();
    const item: ChangeRequest = {
      id: crypto.randomUUID(),
      title: reqTitle.trim(),
      detail: reqDetail.trim(),
      status: "open",
      estimatedMinutes: 15,
      createdAt: now,
      updatedAt: now,
    };
    const title = item.title;
    const client = state.clientName;
    setState((prev) => (prev ? { ...prev, changeRequests: [item, ...prev.changeRequests] } : prev));
    addComment("client", `Nieuwe aanvraag: ${title}`, client);
    setReqTitle("");
    setReqDetail("");
  }

  function setRequestStatus(id: string, status: ChangeRequest["status"]) {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        changeRequests: prev.changeRequests.map((r) =>
          r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r,
        ),
      };
    });
  }

  function logTime(minutes: number, label: string, requestId?: string) {
    if (minutes <= 0 || !state) return;
    const nextTotal = care.total + minutes;
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      label: label.trim() || "Werkzaamheden SiteButler",
      minutes,
      billable: nextTotal > state.includedMinutes,
      createdAt: new Date().toISOString(),
      requestId: requestId || undefined,
    };
    setState((prev) => {
      if (!prev) return prev;
      const requests: ChangeRequest[] = requestId
        ? prev.changeRequests.map((r) => {
            if (r.id !== requestId) return r;
            const status: ChangeRequest["status"] = r.status === "klaar" ? "klaar" : "bezig";
            return { ...r, status, updatedAt: new Date().toISOString() };
          })
        : prev.changeRequests;
      return {
        ...prev,
        timeEntries: [entry, ...prev.timeEntries],
        changeRequests: requests,
      };
    });
    setLogLabel("");
    setLogRequestId("");
  }

  function startTimer(label: string, requestId?: string) {
    if (!state) return;
    const now = new Date().toISOString();
    const nowMs = Date.now();
    setState((prev) => {
      if (!prev) return prev;
      let timeEntries = prev.timeEntries;
      if (prev.activeTimer) {
        const minutes = elapsedToBillableMinutes(prev.activeTimer.startedAt, nowMs);
        const nextTotal = prev.timeEntries.reduce((s, e) => s + e.minutes, 0) + minutes;
        const entry: TimeEntry = {
          id: crypto.randomUUID(),
          label: prev.activeTimer.label,
          minutes,
          billable: nextTotal > prev.includedMinutes,
          createdAt: now,
          requestId: prev.activeTimer.requestId,
        };
        timeEntries = [entry, ...prev.timeEntries];
      }
      const requests: ChangeRequest[] = requestId
        ? prev.changeRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: r.status === "klaar" ? "klaar" : ("bezig" as const),
                  updatedAt: now,
                }
              : r,
          )
        : prev.changeRequests;
      return {
        ...prev,
        timeEntries,
        activeTimer: {
          startedAt: now,
          label: label.trim() || "Werkzaamheden SiteButler",
          requestId,
        },
        changeRequests: requests,
      };
    });
    setNowTick(Date.now());
  }

  function stopTimer() {
    setState((prev) => {
      if (!prev?.activeTimer) return prev;
      const minutes = elapsedToBillableMinutes(prev.activeTimer.startedAt);
      const nextTotal = prev.timeEntries.reduce((s, e) => s + e.minutes, 0) + minutes;
      const entry: TimeEntry = {
        id: crypto.randomUUID(),
        label: prev.activeTimer.label,
        minutes,
        billable: nextTotal > prev.includedMinutes,
        createdAt: new Date().toISOString(),
        requestId: prev.activeTimer.requestId,
      };
      return {
        ...prev,
        activeTimer: null,
        timeEntries: [entry, ...prev.timeEntries],
      };
    });
  }

  return (
    <div className="bg-bg">
      <div className="border-b border-line bg-bg-alt">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-teal uppercase">Klantportaal</p>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink md:text-2xl">
              {state.projectName}
            </h1>
            <p className="text-sm text-ink-soft">
              {state.clientName} · {state.packageName} · {state.carePlan}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn-ghost !px-3 !py-2 text-xs">
              SiteButler
            </Link>
            <button type="button" onClick={resetPortal} className="btn-ghost !px-3 !py-2 text-xs">
              Reset demo
            </button>
            <button type="button" onClick={logout} className="btn-secondary !px-3 !py-2 text-xs">
              Uitloggen
            </button>
            {state.previewUrl ? (
              <Link href={state.previewUrl} className="btn-soft !px-3 !py-2 text-xs">
                Bekijk uw website
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container-x py-8 md:py-10">
        {/* Progress */}
        <div className="mb-8 rounded-xl border border-line bg-[#121a2b] p-5 md:p-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-ink-soft uppercase">Voortgang</p>
              <p className="mt-1 text-sm text-ink">
                Stap {state.completedSteps.length} van {portalSteps.length} afgerond
              </p>
            </div>
            <p className="text-2xl font-extrabold text-teal">{pct}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#007aff] via-[#14b8a6] to-[#16a34a] transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {portalSteps.map((step) => {
              const st = stepStatus(state, step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => update({ activeStep: step.id })}
                  className={`rounded-lg border px-2.5 py-2 text-left transition ${
                    state.activeStep === step.id
                      ? "border-blue bg-blue/15"
                      : "border-line hover:border-line-strong hover:bg-white/5"
                  }`}
                >
                  <span className="mb-1.5 block text-left text-base font-semibold text-ink">
                    {step.short}
                  </span>
                  <span className="flex items-center justify-start gap-1.5">
                    <StatusDot status={st} />
                    <span className="text-[0.6rem] font-bold tracking-wide text-ink-soft uppercase">
                      {st === "done" ? "Klaar" : st === "current" ? "Nu" : "Later"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Care-minuten */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-[#121a2b] p-5">
            <div className="mb-3 flex items-end justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-bold tracking-wide text-teal uppercase">
                  Inbegrepen Care-tijd
                </p>
                <p className="mt-1 text-sm text-ink">
                  {care.includedUsed} / {state.includedMinutes} min gebruikt
                </p>
              </div>
              <p className="text-lg font-extrabold text-teal">{care.includedLeft} min over</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#007aff] to-[#14b8a6] transition-all"
                style={{ width: `${care.includedPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Standaard bij {state.carePlan}: {state.includedMinutes} minuten kleine wijzigingen / maand.
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 ${
              includedExhausted || care.extraUsed > 0
                ? "border-coral/50 bg-[#1a1214]"
                : "border-line bg-[#121a2b] opacity-70"
            }`}
          >
            <div className="mb-3 flex items-end justify-between gap-2">
              <div>
                <p className="text-[0.7rem] font-bold tracking-wide text-coral uppercase">
                  Extra / betalend
                </p>
                <p className="mt-1 text-sm text-ink">
                  {care.extraUsed > 0
                    ? `${care.extraUsed} min buiten Care`
                    : includedExhausted
                      ? "Inbegrepen tijd opgebruikt"
                      : "Nog niet actief"}
                </p>
              </div>
              <p className="text-sm font-bold text-ink-soft">{PORTAL_DEMO.extraRateLabel}</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#f97316] transition-all"
                style={{
                  width: `${care.extraUsed === 0 ? 0 : Math.min(100, 20 + care.extraUsed * 2)}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Zodra de 30 min op zijn, lopen verdere aanpassingen als extra tijd (na akkoord).
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Links: huidige stap */}
          <section className="rounded-xl border border-[#d7e3f2] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] md:p-6">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-ink-on-light">
              {leftActive.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-on-light">{leftActive.description}</p>

            {leftStepId === "offerte" && (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg bg-[#f4f7fb] p-4 text-sm text-ink-on-light">
                  <p className="font-bold">Offerte — {state.packageName}</p>
                  <p className="mt-2 text-muted-on-light">
                    Scope volgens afspraak: website op maat, responsive, contactformulier, basis-SEO en livegang.
                    Detailbedragen staan in uw offerte-PDF (demo).
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    <li>✓ Tot 12 pagina&apos;s + nieuwsmodule</li>
                    <li>✓ Design afgestemd op uw sector</li>
                    <li>✓ Twee feedbackrondes + 30 dagen nazorg</li>
                  </ul>
                </div>
                {!state.offerAccepted ? (
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={() => {
                      update({ offerAccepted: true });
                      completeStep("offerte");
                    }}
                  >
                    Offerte bevestigen
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-green">Offerte bevestigd ✓</p>
                )}
              </div>
            )}

            {leftStepId === "contract" && (
              <div className="mt-5 space-y-4">
                <div className="max-h-40 overflow-y-auto rounded-lg border border-[#d7e3f2] bg-[#f8fafc] p-4 text-xs leading-relaxed text-muted-on-light">
                  <p className="mb-2 font-bold text-ink-on-light">Overeenkomst websiteontwikkeling (samenvatting)</p>
                  <p>
                    SiteButler levert het overeengekomen websitepakket. De klant levert tijdig content aan.
                    Betaling volgens offerte. Intellectuele eigendom van het eindresultaat gaat na volledige
                    betaling over naar de klant. SiteButler mag het project als referentie tonen tenzij anders
                    afgesproken. Digitaal ondertekenen geldt als aanvaarding van deze voorwaarden.
                  </p>
                </div>
                {state.contractSigned ? (
                  <div className="rounded-lg bg-green-soft p-4 text-sm text-ink-on-light">
                    <p className="font-bold text-green">Contract ondertekend ✓</p>
                    <p className="mt-1 text-muted-on-light">
                      Door {state.signerName} op{" "}
                      {state.signedAt ? new Date(state.signedAt).toLocaleString("nl-BE") : "—"}
                    </p>
                    {state.signatureDataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={state.signatureDataUrl} alt="Handtekening" className="mt-3 h-16 rounded border border-[#cdd8e8] bg-white" />
                    )}
                  </div>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-ink-on-light">
                      Volledige naam
                      <input
                        value={state.signerName}
                        onChange={(e) => update({ signerName: e.target.value })}
                        className="input-field mt-1.5"
                        placeholder="Voor- en achternaam"
                      />
                    </label>
                    <div>
                      <p className="mb-1.5 text-sm font-semibold text-ink-on-light">Handtekening</p>
                      <SignaturePad onChange={(url) => update({ signatureDataUrl: url })} />
                    </div>
                    <button
                      type="button"
                      className="btn-primary text-sm disabled:opacity-40"
                      disabled={!state.signerName.trim() || !state.signatureDataUrl || !state.offerAccepted}
                      onClick={() => {
                        update({
                          contractSigned: true,
                          signedAt: new Date().toISOString(),
                        });
                        completeStep("contract");
                      }}
                    >
                      Digitaal ondertekenen
                    </button>
                    {!state.offerAccepted && (
                      <p className="text-xs text-coral">Bevestig eerst de offerte.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {leftStepId === "briefing" && (
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-ink-on-light">
                  Wat moet de website doen?
                  <textarea
                    value={state.goals}
                    onChange={(e) => update({ goals: e.target.value })}
                    className="input-field mt-1.5 min-h-20"
                    placeholder="Bv. afspraken, telefoneren, vertrouwen opbouwen…"
                  />
                </label>
                <label className="block text-sm font-semibold text-ink-on-light">
                  Projectbeschrijving
                  <textarea
                    value={state.briefing}
                    onChange={(e) => update({ briefing: e.target.value })}
                    className="input-field mt-1.5 min-h-28"
                    placeholder="Pagina's, sfeer, must-haves, concurrenten…"
                  />
                </label>
                <label className="block text-sm font-semibold text-ink-on-light">
                  Referentiesites
                  <textarea
                    value={state.references}
                    onChange={(e) => update({ references: e.target.value })}
                    className="input-field mt-1.5 min-h-16"
                    placeholder="Links naar sites die u mooi/relevant vindt"
                  />
                </label>
                <div>
                  <p className="mb-1.5 text-sm font-semibold text-ink-on-light">Uploads (logo, teksten, foto&apos;s…)</p>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#b7c7dc] bg-[#f8fafc] px-4 py-8 text-center transition hover:border-blue hover:bg-blue-soft/40">
                    <span className="text-sm font-semibold text-ink-on-light">Klik om bestanden te kiezen</span>
                    <span className="mt-1 text-xs text-muted-on-light">PDF, DOC, JPG, PNG, ZIP…</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                  </label>
                  {state.files.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {state.files.map((f) => (
                        <li key={f.id} className="flex items-center justify-between rounded-md bg-[#f4f7fb] px-3 py-2 text-xs text-ink-on-light">
                          <span className="font-semibold">{f.name}</span>
                          <span className="text-muted-on-light">{f.sizeLabel}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-primary text-sm"
                  disabled={!state.briefing.trim() || !state.contractSigned}
                  onClick={() => completeStep("briefing")}
                >
                  Briefing indienen
                </button>
              </div>
            )}

            {leftStepId === "ontwerp" && (
              <div className="mt-2 space-y-3">
                <p className="-mt-1 text-sm text-muted-on-light">
                  Zodra het ontwerp klaar is, verschijnt hier een preview. Open fullscreen voor een duidelijk overzicht.
                </p>
                <label className="block text-sm font-semibold text-ink-on-light">
                  Preview-URL (invulbaar door SiteButler)
                  <input
                    value={state.previewUrl}
                    onChange={(e) => update({ previewUrl: e.target.value })}
                    className="input-field mt-1.5"
                    placeholder="/portaal/myurusdream"
                  />
                </label>
                <div className="mb-5 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
                  {state.previewUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewFullscreen(true)}
                        className="shrink-0 rounded-md border border-[#0d9488] bg-[#ccfbf1] px-2.5 py-1.5 text-xs font-semibold text-[#0f766e]"
                      >
                        Fullscreen
                      </button>
                      <a
                        href={state.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md border border-[#cdd8e8] bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-on-light"
                      >
                        Nieuw tabblad
                      </a>
                    </>
                  )}
                  {state.activeStep !== "feedback" && (
                    <button
                      type="button"
                      className="shrink-0 rounded-md bg-blue px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      disabled={!state.completedSteps.includes("briefing")}
                      onClick={() => {
                        setState((prev) => {
                          if (!prev) return prev;
                          const completed: PortalStepId[] = prev.completedSteps.includes("ontwerp")
                            ? prev.completedSteps
                            : [...prev.completedSteps, "ontwerp"];
                          const withoutLater = completed.filter(
                            (id): id is PortalStepId => id !== "feedback" && id !== "live",
                          );
                          return {
                            ...prev,
                            previewUrl: prev.previewUrl || PORTAL_DEMO.liveSitePath,
                            completedSteps: withoutLater,
                            activeStep: "feedback",
                          };
                        });
                      }}
                    >
                      Ontwerp klaar
                    </button>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border border-[#d7e3f2] bg-[#0a111c]">
                  {state.previewUrl ? (
                    <iframe
                      title="Preview"
                      src={state.previewUrl}
                      className="h-[min(70vh,36rem)] w-full bg-white"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-ink-soft">
                      Nog geen preview. Zodra wij een link plaatsen, ziet u hier een voorvertoning.
                    </div>
                  )}
                </div>
              </div>
            )}

            {state.activeStep === "live" && (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-[#007aff] via-[#0d9488] to-[#16a34a] p-5 text-white">
                  <p className="text-sm font-bold uppercase tracking-wide text-white/80">Livegang</p>
                  <p className="mt-2 text-lg font-bold">Uw site is klaar om live te gaan.</p>
                  <p className="mt-1 text-sm text-white/90">
                    Domein, SSL en eventuele Butler Care regelen we samen bij oplevering.
                  </p>
                </div>
                {!state.completedSteps.includes("live") && (
                  <button type="button" className="btn-primary text-sm" onClick={() => completeStep("live")}>
                    Livegang bevestigen
                  </button>
                )}
                {state.completedSteps.includes("live") && (
                  <p className="text-sm font-semibold text-green">
                    Project afgerond ✓ — vraag hieronder wijzigingen aan en volg uw Care-minuten op.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Rechts: Feedback (zelfde kolom/layout als Berichten) */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-[#d7e3f2] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
              <p className="text-[0.7rem] font-bold tracking-[0.14em] text-teal-deep uppercase">Feedback</p>

              <div className="mt-3 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field min-h-20 text-sm"
                  placeholder="Bv. Headerfoto vervangen, telefoonnummer groter…"
                />
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  onClick={() => {
                    addComment("client", comment, state.clientName, null);
                    setComment("");
                    update({ activeStep: "feedback" });
                  }}
                >
                  Comment plaatsen
                </button>
              </div>

              <div className="mt-3 max-h-[28rem] space-y-3 overflow-y-auto">
                {(state.comments ?? []).filter((c) => !c.parentId).length === 0 && (
                  <p className="text-sm text-muted-on-light">Nog geen feedback geplaatst.</p>
                )}
                {[...(state.comments ?? [])]
                  .filter((c) => !c.parentId)
                  .reverse()
                  .map((c) => {
                    const replies = (state.comments ?? [])
                      .filter((r) => r.parentId === c.id)
                      .sort(
                        (a, b) =>
                          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                      );
                    return (
                      <div key={c.id} className="space-y-2">
                        <div
                          className={`rounded-lg px-3 py-2.5 text-sm ${
                            c.author === "builder"
                              ? "bg-[#eef6ff] text-ink-on-light"
                              : "bg-[#f4f7fb] text-ink-on-light"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-xs font-bold">{c.name}</span>
                            <span className="text-[0.65rem] text-muted-on-light">
                              {new Date(c.createdAt).toLocaleString("nl-BE", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm leading-snug">{c.text}</p>
                          <button
                            type="button"
                            className="mt-2 text-[0.7rem] font-semibold text-teal-deep hover:underline"
                            onClick={() => {
                              setReplyToId(replyToId === c.id ? null : c.id);
                              setReplyText("");
                            }}
                          >
                            {replyToId === c.id ? "Annuleren" : "Antwoorden"}
                          </button>
                        </div>

                        {replies.map((r) => (
                          <div
                            key={r.id}
                            className={`ml-3 rounded-lg border-l-2 border-[#93c5fd] px-3 py-2 text-sm ${
                              r.author === "builder"
                                ? "bg-[#eef6ff] text-ink-on-light"
                                : "bg-[#f4f7fb] text-ink-on-light"
                            }`}
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-xs font-bold">{r.name}</span>
                              <span className="text-[0.65rem] text-muted-on-light">
                                {new Date(r.createdAt).toLocaleString("nl-BE", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm leading-snug">{r.text}</p>
                          </div>
                        ))}

                        {replyToId === c.id && (
                          <div className="ml-3 space-y-2 rounded-lg border border-dashed border-[#cdd8e8] bg-[#f8fafc] p-2.5">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="input-field min-h-14 text-sm"
                              placeholder="Uw antwoord…"
                              autoFocus
                            />
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                className="btn-primary w-full text-xs"
                                onClick={() => {
                                  addComment("client", replyText, state.clientName, c.id);
                                  setReplyText("");
                                  setReplyToId(null);
                                  update({ activeStep: "feedback" });
                                }}
                              >
                                Antwoord plaatsen
                              </button>
                              <button
                                type="button"
                                className="btn-secondary w-full text-xs"
                                onClick={() => {
                                  addComment("builder", replyText, "SiteButler", c.id);
                                  setReplyText("");
                                  setReplyToId(null);
                                }}
                              >
                                Reply als SiteButler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {!state.completedSteps.includes("feedback") && (
                <button
                  type="button"
                  className="btn-primary mt-4 w-full text-sm"
                  onClick={() => completeStep("feedback")}
                >
                  Feedbackronde afronden
                </button>
              )}
            </div>
          </aside>
        </div>

        {/* Wijzigingen na live / Care */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[#d7e3f2] bg-white p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)] md:p-6">
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-teal-deep uppercase">
              Wijzigingsaanvragen
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-ink-on-light">
              Iets aanpassen aan de site?
            </h2>
            <p className="mt-1 text-sm text-muted-on-light">
              U vraagt hier aan. SiteButler voert uit in Cursor op uw project en boekt de minuten op uw Care-tegoed.
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                className="input-field"
                placeholder="Korte titel (bv. Telefoonnummer in header)"
              />
              <textarea
                value={reqDetail}
                onChange={(e) => setReqDetail(e.target.value)}
                className="input-field min-h-24"
                placeholder="Wat moet er precies anders? Pagina, tekst, foto…"
              />
              <button type="button" className="btn-primary text-sm" onClick={addChangeRequest}>
                Aanvraag indienen
              </button>
            </div>

            <ul className="mt-6 space-y-3">
              {state.changeRequests.length === 0 && (
                <li className="text-sm text-muted-on-light">Nog geen aanvragen.</li>
              )}
              {state.changeRequests.map((r) => (
                <li key={r.id} className="rounded-lg border border-[#e2eaf4] bg-[#f8fafc] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-ink-on-light">{r.title}</p>
                      <p className="mt-1 text-sm text-muted-on-light">{r.detail}</p>
                    </div>
                    <span
                      className={`rounded-md px-2 py-1 text-[0.65rem] font-bold uppercase ${
                        r.status === "klaar"
                          ? "bg-green-soft text-[#166534]"
                          : r.status === "bezig"
                            ? "bg-blue-soft text-[#1d4ed8]"
                            : "bg-[#eef2f7] text-muted-on-light"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-md bg-teal px-2.5 py-1 text-xs font-bold text-white"
                      onClick={() => startTimer(`Aanvraag: ${r.title}`, r.id)}
                    >
                      {state.activeTimer?.requestId === r.id ? "Timer herstart" : "Start timer"}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[#cdd8e8] px-2.5 py-1 text-xs font-semibold text-ink-on-light"
                      onClick={() => setRequestStatus(r.id, "bezig")}
                    >
                      Markeer bezig
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[#cdd8e8] px-2.5 py-1 text-xs font-semibold text-ink-on-light"
                      onClick={() => setRequestStatus(r.id, "klaar")}
                    >
                      Markeer klaar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-[#121a2b] p-5">
            <p className="text-[0.7rem] font-bold tracking-wide text-ink-soft uppercase">
              Timer &amp; tijdregistratie
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Start bij begin van het werk, stop als je klaar bent — minuten gaan automatisch op de Care-balk
              (afgerond per minuut, min. 1).
            </p>

            {state.activeTimer ? (
              <div className="mt-4 rounded-lg border border-teal/40 bg-teal/10 p-4">
                <p className="text-[0.65rem] font-bold tracking-wide text-teal uppercase">Bezig</p>
                <p className="mt-1 text-sm font-semibold text-ink">{state.activeTimer.label}</p>
                <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tabular-nums text-white">
                  {formatTimerClock(state.activeTimer.startedAt, nowTick)}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Wordt geboekt als ~{elapsedToBillableMinutes(state.activeTimer.startedAt, nowTick)} min bij stop
                </p>
                <button type="button" className="btn-primary mt-4 w-full text-sm" onClick={stopTimer}>
                  Stop &amp; boeken
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <input
                  value={logLabel}
                  onChange={(e) => setLogLabel(e.target.value)}
                  className="input-field !bg-white"
                  placeholder="Waar werk je aan? (bv. Header aanpassen)"
                />
                {state.changeRequests.length > 0 && (
                  <select
                    value={logRequestId}
                    onChange={(e) => setLogRequestId(e.target.value)}
                    className="input-field !bg-white text-sm"
                  >
                    <option value="">Koppel aan aanvraag (optioneel)</option>
                    {state.changeRequests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  className="btn-primary w-full text-sm"
                  onClick={() =>
                    startTimer(
                      logLabel ||
                        (logRequestId
                          ? `Aanvraag: ${state.changeRequests.find((r) => r.id === logRequestId)?.title ?? "werk"}`
                          : "Algemeen onderhoud"),
                      logRequestId || undefined,
                    )
                  }
                >
                  Start timer
                </button>
              </div>
            )}

            <details className="mt-5 rounded-lg bg-white/5 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-ink-soft">
                Handmatig bijboeken (optioneel)
              </summary>
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 30].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogMinutes(m)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                        logMinutes === m ? "bg-teal text-white" : "bg-white/10 text-ink"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-secondary w-full text-xs"
                  onClick={() => logTime(logMinutes, logLabel || "Handmatige boeking", logRequestId || undefined)}
                >
                  {logMinutes} min manueel registreren
                </button>
              </div>
            </details>

            <ul className="mt-5 max-h-56 space-y-2 overflow-y-auto">
              {state.timeEntries.length === 0 && (
                <li className="text-xs text-ink-soft">Nog geen tijd geboekt.</li>
              )}
              {state.timeEntries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-white/5 px-3 py-2 text-xs"
                >
                  <span className="text-ink">
                    {e.label}
                    {e.billable && <span className="ml-1 text-coral">(extra)</span>}
                  </span>
                  <span className="shrink-0 font-bold text-teal">{e.minutes} min</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {previewFullscreen && state.previewUrl && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#070d16]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-6">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold tracking-wide text-teal uppercase">Ontwerppreview</p>
              <p className="truncate text-sm font-semibold text-ink">{state.projectName}</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewFullscreen(false)}
              className="shrink-0 rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#007aff] shadow-lg transition hover:bg-[#f5f9ff]"
            >
              Sluiten
            </button>
          </div>
          <iframe title="Ontwerp fullscreen" src={state.previewUrl} className="min-h-0 flex-1 w-full bg-white" />
        </div>
      )}
    </div>
  );
}
