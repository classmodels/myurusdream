"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function BriefingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);
    if (files) Array.from(files).forEach((file) => data.append("bestanden", file));
    data.set("type", "briefing");

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
    <form onSubmit={onSubmit} className="card card-teal space-y-6 p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="naam">Contactpersoon *</label>
          <input id="naam" name="naam" required className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="bedrijf">Zaak / project *</label>
          <input id="bedrijf" name="bedrijf" required className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail *</label>
          <input id="email" name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="label" htmlFor="telefoon">Telefoon</label>
          <input id="telefoon" name="telefoon" className="input-field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="branche">Branche</label>
        <input id="branche" name="branche" className="input-field" placeholder="Wat doet uw zaak?" />
      </div>

      <div>
        <label className="label" htmlFor="content">Wat levert u aan?</label>
        <textarea id="content" name="content" rows={3} className="input-field resize-y" placeholder="Teksten, logo, foto's, voorbeelden, filmpjes..." />
      </div>

      <div>
        <label className="label" htmlFor="musthaves">Wensen voor de site</label>
        <textarea id="musthaves" name="musthaves" rows={3} className="input-field resize-y" placeholder="Pagina's, webshop, afspraken, meertalig..." />
      </div>

      <div>
        <label className="label" htmlFor="bestanden">Upload bestanden *</label>
        <input
          id="bestanden"
          type="file"
          multiple
          required
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.svg,.zip,.mp4,.mov"
          className="input-field"
          onChange={(e) => setFiles(e.target.files)}
        />
        <p className="mt-1 text-xs text-muted">
          {files?.length ? `${files.length} bestand(en)` : "Teksten, logo, foto's, video's, voorbeelden..."}
        </p>
      </div>

      <button type="submit" className="btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Uploaden..." : "Briefing indienen"}
      </button>

      {message && (
        <p className={`rounded-md px-4 py-3 text-sm font-medium ${status === "success" ? "bg-green-soft text-[#166534]" : "bg-coral-soft text-[#b91c1c]"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
