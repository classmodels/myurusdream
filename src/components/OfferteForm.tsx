"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { packages } from "@/lib/content";

type Status = "idle" | "loading" | "success" | "error";

export function OfferteForm() {
  const params = useSearchParams();
  const initialPakket = params.get("pakket") || "compleet";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const selectedLabel = useMemo(
    () => packages.find((p) => p.id === initialPakket)?.name ?? "Compleet",
    [initialPakket],
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    if (files) Array.from(files).forEach((file) => data.append("bestanden", file));
    data.set("type", "offerte");

    try {
      const res = await fetch("/api/aanvraag", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Er ging iets mis");
      setStatus("success");
      setMessage(json.message);
      form.reset();
      setFiles(null);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verzenden mislukt");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card card-mix space-y-6 p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="naam">Naam *</label>
          <input id="naam" name="naam" required className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="bedrijf">Bedrijf / zaak</label>
          <input id="bedrijf" name="bedrijf" className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail *</label>
          <input id="email" name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="telefoon">Telefoon</label>
          <input id="telefoon" name="telefoon" className="input-field" />
        </div>
        <div className="md:col-span-2">
          <label className="label" htmlFor="branche">Branche *</label>
          <input id="branche" name="branche" required className="input-field" placeholder="bv. bakkerij, garage, tandarts, retail..." />
        </div>
        <div>
          <label className="label" htmlFor="pakket">Pakket</label>
          <select id="pakket" name="pakket" defaultValue={initialPakket} className="input-field">
            {packages.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.price}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Gekozen: {selectedLabel}</p>
        </div>
        <div>
          <label className="label" htmlFor="extras">Extra&apos;s gewenst</label>
          <select id="extras" name="extras" className="input-field" defaultValue="nog-niet-zeker">
            <option value="geen">Alleen website</option>
            <option value="logo">+ Logo</option>
            <option value="teksten">+ Teksten</option>
            <option value="foto">+ Foto&apos;s</option>
            <option value="video">+ Filmpje</option>
            <option value="alles">Website + logo + teksten + foto/video</option>
            <option value="nog-niet-zeker">Nog niet zeker</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="designKeuze">Design *</label>
          <select id="designKeuze" name="designKeuze" required className="input-field" defaultValue="volledig-door-ons">
            <option value="volledig-door-ons">Jullie ontwerpen alles</option>
            <option value="eigen-ontwerp">Ik lever zelf een ontwerp</option>
            <option value="samen">Ik heb logo/kleuren, jullie doen de rest</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="budget">Budget</label>
          <select id="budget" name="budget" className="input-field" defaultValue="1250-2995">
            <option value="tot-1250">Tot €1.250</option>
            <option value="1250-2995">€1.250 – €2.995</option>
            <option value="2995-7500">€2.995 – €7.500</option>
            <option value="7500-plus">€7.500+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="doel">Wat moet de website doen? *</label>
        <textarea id="doel" name="doel" required rows={4} className="input-field resize-y" placeholder="Meer klanten, bestellingen, afspraken, info..." />
      </div>

      <div>
        <label className="label" htmlFor="bestanden">Bijlagen (optioneel)</label>
        <input
          id="bestanden"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg,.zip"
          className="input-field"
          onChange={(e) => setFiles(e.target.files)}
        />
        <p className="mt-1 text-xs text-muted">{files?.length ? `${files.length} geselecteerd` : "Logo, foto's, voorbeelden..."}</p>
      </div>

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Verzenden..." : "Offerte aanvragen"}
      </button>

      {message && (
        <p className={`rounded-md px-4 py-3 text-sm font-medium ${status === "success" ? "bg-green-soft text-[#166534]" : "bg-coral-soft text-[#b91c1c]"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
