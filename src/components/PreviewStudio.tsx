"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TEST_SLOT_COUNT, isPublicPreview, type PreviewProject } from "@/lib/preview-model";

type Slot = PreviewProject;

const blank: Partial<PreviewProject> = {
  title: "",
  clientLabel: "In opbouw",
  summary: "",
  progress: 40,
  accessCode: "",
  previewUrl: "",
  tagline: "",
  heroText: "",
  about: "",
  services: "",
  contact: "",
  accent: "#2563eb",
  accent2: "#0f766e",
  published: true,
  liveSiteSlug: "",
};

export function PreviewStudio() {
  const [manageCode, setManageCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [extras, setExtras] = useState<Slot[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<PreviewProject>>(blank);
  const [pageTitle, setPageTitle] = useState("Homepage");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [hostedSites, setHostedSites] = useState<{ slug: string; basePath: string; label: string }[]>(
    [],
  );

  const current = active ? slots.find((s) => s.slot === active) : null;

  function setField<K extends keyof PreviewProject>(key: K, value: PreviewProject[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function formFromSlot(slot: Slot): Partial<PreviewProject> {
    const placeholderTitle = `Testsite ${slot.slot}`;
    return {
      ...slot,
      title: slot.title === placeholderTitle ? "" : slot.title,
      clientLabel: slot.clientLabel === "Nog niet ingesteld" ? "In opbouw" : slot.clientLabel,
      published: slot.accessCode ? Boolean(slot.published) : true,
    };
  }

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/preview-catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manageCode, ...body }),
    });
    const data = (await res.json()) as {
      error?: string;
      slots?: Slot[];
      extras?: Slot[];
      project?: Slot;
    };
    if (!res.ok) throw new Error(data.error || "Mislukt.");
    if (data.slots) setSlots(data.slots);
    if (data.extras) setExtras(data.extras);
    return data;
  }

  async function unlock() {
    setBusy(true);
    setError("");
    try {
      await post({ action: "unlock" });
      const hosted = await fetch("/api/hosted-sites");
      if (hosted.ok) {
        const data = (await hosted.json()) as {
          sites?: { slug: string; basePath: string; label: string }[];
        };
        setHostedSites(data.sites || []);
      }
      setUnlocked(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!active) return;
    const slot = slots.find((s) => s.slot === active);
    if (!slot) return;
    setForm(formFromSlot(slot));
    setNotice("");
    setError("");
    // Only when switching slot — not on every catalog refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function openSlot(n: number) {
    setActive(n);
  }

  async function save() {
    if (!active) return;
    if (form.previewUrl?.trim() && !isPublicPreview(form.previewUrl.trim())) {
      setError("localhost kan de klant niet openen. Gebruik een https-tunnel of testdomein.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await post({
        action: "update",
        project: {
          ...form,
          slot: active,
          slug: `testsite-${active}`,
          title: form.title || `Testsite ${active}`,
          summary: form.summary || form.heroText || form.tagline || "",
          pages: current?.pages || [],
          logoUrl: current?.logoUrl || "",
        },
      });
      const code = data.project?.accessCode || form.accessCode;
      const path = data.project?.publicSlug || form.publicSlug || `testsite-${active}`;
      setNotice(
        form.published
          ? `Live: /portaal/${path}  (www.sitebutler.be/portaal/${path})`
          : "Bewaard als concept. Zet ‘Zichtbaar voor klant’ aan om te delen.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(kind: "logo" | "page", file: File) {
    if (!active) return;
    setBusy(true);
    setError("");
    try {
      await post({
        action: "update",
        project: {
          ...form,
          slot: active,
          slug: `testsite-${active}`,
          title: form.title || `Testsite ${active}`,
          summary: form.summary || form.heroText || form.tagline || "",
          pages: current?.pages || [],
          logoUrl: current?.logoUrl || "",
        },
      });
      const data = new FormData();
      data.set("manageCode", manageCode);
      data.set("slug", `testsite-${active}`);
      data.set("kind", kind);
      data.set("title", kind === "page" ? pageTitle : "Logo");
      data.set("file", file);
      const res = await fetch("/api/preview-assets", { method: "POST", body: data });
      const json = (await res.json()) as { error?: string; project?: Slot };
      if (!res.ok) throw new Error(json.error || "Upload mislukt.");
      if (json.project) {
        setSlots((prev) => prev.map((s) => (s.slot === active ? { ...s, ...json.project } : s)));
      }
      setNotice(kind === "logo" ? "Logo gezet." : "Schermafbeelding toegevoegd.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(imageUrl: string, kind: "logo" | "page") {
    if (!active) return;
    setBusy(true);
    try {
      const res = await fetch("/api/preview-assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manageCode, slug: `testsite-${active}`, imageUrl, kind }),
      });
      const json = (await res.json()) as { error?: string; project?: Slot };
      if (!res.ok) throw new Error(json.error || "Mislukt.");
      if (json.project) {
        setSlots((prev) => prev.map((s) => (s.slot === active ? { ...s, ...json.project } : s)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  async function clearSlot(n: number) {
    setBusy(true);
    try {
      await post({ action: "clear", slug: `testsite-${n}` });
      if (active === n) setNotice("Testsite leeggemaakt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mislukt.");
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <div className="card mx-auto max-w-md p-6">
        <h2 className="text-xl font-bold text-ink-on-light">Testsites beheren</h2>
        <p className="mt-2 text-sm text-muted-on-light">
          Tien vaste plekken. U vult een testsite, de klant krijgt een link en code.
        </p>
        <label className="label mt-5" htmlFor="manage-code">
          Beheercode
        </label>
        <input
          id="manage-code"
          className="input-field"
          type="password"
          value={manageCode}
          onChange={(e) => setManageCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void unlock();
          }}
        />
        {error && <p className="mt-3 text-sm text-coral">{error}</p>}
        <button type="button" className="btn-primary mt-4 w-full text-sm" onClick={() => void unlock()}>
          Ontgrendelen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">Kies een testsite</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Klik een nummer, plak de https-link van de echte site, sla op, en deel de klantlink.
          Foto’s zijn extra — niet de website zelf.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: TEST_SLOT_COUNT }, (_, i) => i + 1).map((n) => {
            const slot = slots.find((s) => s.slot === n);
            const filled = Boolean(
              slot?.published &&
                (slot.previewUrl ||
                  slot.title !== `Testsite ${n}` ||
                  (slot.pages || []).length),
            );
            const draft = Boolean(slot?.accessCode) && !slot?.published;
            return (
              <button
                key={n}
                type="button"
                onClick={() => openSlot(n)}
                className={`rounded-xl border p-4 text-left transition ${
                  active === n
                    ? "border-teal bg-teal/15"
                    : "border-line bg-white/5 hover:border-teal/50"
                }`}
              >
                <p className="text-xs font-bold tracking-wide text-teal uppercase">Testsite {n}</p>
                <p className="mt-1 truncate text-sm font-bold text-ink">{slot?.title || `Testsite ${n}`}</p>
                <p className="mt-1 text-[11px] text-ink-soft">
                  {filled ? "Zichtbaar voor klant" : draft ? "Concept" : "Leeg"}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Testsite {active}</p>
              <h2 className="mt-1 text-xl font-bold text-ink-on-light">Site klaarzetten</h2>
            </div>
            <Link
              href={form.publicSlug ? `/portaal/${form.publicSlug}` : `/test/${active}`}
              className="btn-ghost !px-3 !py-2 text-sm"
              target="_blank"
            >
              Open klantlink
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-teal/30 bg-teal/5 p-4 md:p-5">
            <h3 className="font-bold text-ink-on-light">De echte website (niet foto’s)</h3>
            <p className="mt-1 text-sm text-muted-on-light">
              Plak hier de publieke https-link van de site die u aan het bouwen bent. De klant ziet
              die pagina hier in beeld en kan klikken. <code className="text-ink-on-light">localhost</code>{" "}
              werkt niet voor klanten.
            </p>
            <label className="label mt-4" htmlFor="t-url">
              Link naar de site
            </label>
            <input
              id="t-url"
              className="input-field"
              placeholder="https://….vercel.app of https://….trycloudflare.com"
              value={form.previewUrl || ""}
              onChange={(e) => setField("previewUrl", e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-on-light">
              Snelste manier vanaf uw laptop: site starten, daarna in een tweede terminal{" "}
              <code className="text-ink-on-light">npx cloudflared tunnel --url http://localhost:3000</code>{" "}
              (zet het poortnummer van díé site). Plak de https-link die u krijgt.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="t-title">
                Naam van het bedrijf / de site
              </label>
              <input
                id="t-title"
                className="input-field"
                value={form.title || ""}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Bakkerij De Korst"
              />
            </div>
            <div>
              <label className="label" htmlFor="t-label">
                Korte label
              </label>
              <input
                id="t-label"
                className="input-field"
                value={form.clientLabel || ""}
                onChange={(e) => setField("clientLabel", e.target.value)}
                placeholder="Nieuwe website"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="t-tag">
                Slogan
              </label>
              <input
                id="t-tag"
                className="input-field"
                value={form.tagline || ""}
                onChange={(e) => setField("tagline", e.target.value)}
                placeholder="Vers brood, elke ochtend"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="t-hero">
                Introtekst
              </label>
              <textarea
                id="t-hero"
                className="input-field min-h-24 resize-y"
                value={form.heroText || ""}
                onChange={(e) => setField("heroText", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="t-about">
                Over ons
              </label>
              <textarea
                id="t-about"
                className="input-field min-h-24 resize-y"
                value={form.about || ""}
                onChange={(e) => setField("about", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="t-services">
                Aanbod (één per regel)
              </label>
              <textarea
                id="t-services"
                className="input-field min-h-24 resize-y"
                value={form.services || ""}
                onChange={(e) => setField("services", e.target.value)}
                placeholder={"Brood\nGebak\nCatering"}
              />
            </div>
            <div>
              <label className="label" htmlFor="t-contact">
                Contact (e-mail / tel)
              </label>
              <textarea
                id="t-contact"
                className="input-field min-h-20 resize-y"
                value={form.contact || ""}
                onChange={(e) => setField("contact", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="t-slug">
                Sitenaam in de URL (www.sitebutler.be/portaal/…)
              </label>
              <input
                id="t-slug"
                className="input-field"
                value={form.publicSlug || ""}
                onChange={(e) => setField("publicSlug", e.target.value)}
                placeholder="bakkerij-de-korst"
              />
            </div>
            <div>
              <label className="label" htmlFor="t-mail">
                Klantlogin — e-mail
              </label>
              <input
                id="t-mail"
                className="input-field"
                type="email"
                value={form.portalEmail || ""}
                onChange={(e) => setField("portalEmail", e.target.value)}
                placeholder="klant@bedrijf.be"
              />
            </div>
            <div>
              <label className="label" htmlFor="t-pw">
                Klantlogin — wachtwoord
              </label>
              <input
                id="t-pw"
                className="input-field"
                value={form.portalPassword || ""}
                onChange={(e) => setField("portalPassword", e.target.value)}
                placeholder="Kies een wachtwoord voor de klant"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label" htmlFor="t-live">
                Welke live site mag deze klant zien?
              </label>
              <select
                id="t-live"
                className="input-field"
                value={form.liveSiteSlug || ""}
                onChange={(e) => setField("liveSiteSlug", e.target.value)}
              >
                <option value="">Nog niet gekozen</option>
                {hostedSites.map((site) => (
                  <option key={site.slug} value={site.slug}>
                    {site.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-soft">
                Na inloggen in het klantenportaal ziet de klant alleen deze site.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="t-code">
                Toegangscode (voor de link /s/…)
              </label>
              <input
                id="t-code"
                className="input-field"
                value={form.accessCode || ""}
                onChange={(e) => setField("accessCode", e.target.value)}
                placeholder="Wordt automatisch gemaakt als u leeg laat"
              />
            </div>
            <div>
              <label className="label" htmlFor="t-prog">
                Voortgang ({form.progress || 0}%)
              </label>
              <input
                id="t-prog"
                type="range"
                min={0}
                max={100}
                className="mt-3 w-full"
                value={form.progress || 0}
                onChange={(e) => setField("progress", Number(e.target.value))}
              />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="label" htmlFor="t-a">
                  Kleur 1
                </label>
                <input
                  id="t-a"
                  type="color"
                  className="h-10 w-16 cursor-pointer rounded-md border border-[#cdd8e8]"
                  value={form.accent || "#2563eb"}
                  onChange={(e) => setField("accent", e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="t-b">
                  Kleur 2
                </label>
                <input
                  id="t-b"
                  type="color"
                  className="h-10 w-16 cursor-pointer rounded-md border border-[#cdd8e8]"
                  value={form.accent2 || "#0f766e"}
                  onChange={(e) => setField("accent2", e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-on-light md:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(form.published)}
                onChange={(e) => setField("published", e.target.checked)}
              />
              Zichtbaar voor de klant op /voortgang
            </label>
          </div>

          <div className="mt-6 border-t border-[#e6edf5] pt-5">
            <h3 className="font-bold text-ink-on-light">Optioneel: logo en extra foto’s</h3>
            <p className="mt-1 text-sm text-muted-on-light">
              Alleen als er nog geen live link is, of als extra sfeerbeelden. Dit vervangt de site niet.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload("logo", file);
                    e.target.value = "";
                  }}
                />
                {current?.logoUrl ? (
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={current.logoUrl} alt="" className="h-12 w-12 rounded-md object-contain bg-[#f4f7fb]" />
                    <button type="button" className="text-sm font-semibold text-coral" onClick={() => void removeImage(current.logoUrl!, "logo")}>
                      Logo weg
                    </button>
                  </div>
                ) : null}
              </div>
              <div>
                <label className="label" htmlFor="page-title">
                  Naam van deze pagina
                </label>
                <input
                  id="page-title"
                  className="input-field"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                />
                <label className="label mt-3">Screenshot toevoegen</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full text-sm"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload("page", file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
            {(current?.pages || []).length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(current?.pages || []).map((page) => (
                  <figure key={page.imageUrl} className="overflow-hidden rounded-lg bg-[#f4f7fb] ring-1 ring-[#dbe4f0]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={page.imageUrl} alt={page.title} className="h-24 w-full object-cover" />
                    <figcaption className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                      <span className="truncate font-semibold text-ink-on-light">{page.title}</span>
                      <button type="button" className="font-bold text-coral" onClick={() => void removeImage(page.imageUrl, "page")}>
                        ×
                      </button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          {error && <p className="mt-4 text-sm text-coral">{error}</p>}
          {notice && <p className="mt-4 text-sm text-teal-deep">{notice}</p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn-primary text-sm" disabled={busy} onClick={() => void save()}>
              Testsite opslaan
            </button>
            <button
              type="button"
              className="rounded-md border border-coral/40 px-4 py-2 text-sm font-semibold text-coral"
              disabled={busy}
              onClick={() => void clearSlot(active)}
            >
              Leegmaken
            </button>
          </div>
        </div>
      )}

      {extras.length > 0 && (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">Andere projecten</h2>
          <div className="mt-3 grid gap-3">
            {extras.map((p) => (
              <div key={p.slug} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-ink-on-light">{p.title}</p>
                  <p className="text-sm text-muted-on-light">
                    {p.progress}% · /voortgang/{p.slug}
                  </p>
                </div>
                <Link href={`/voortgang/${p.slug}`} className="btn-ghost !px-3 !py-2 text-sm">
                  Openen
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
