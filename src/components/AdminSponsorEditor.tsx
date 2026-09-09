"use client";

import { useState, useTransition } from "react";
import { compressLogo } from "@/lib/compress-logo";
import { updateSponsorPlacement, deletePayment } from "@/app/admin/actions";

type Row = {
  id: string;
  sponsorName: string | null;
  sponsorUrl: string | null;
  sponsorTier: string | null;
  pixelImage: string | null;
  pixelLabel: string | null;
  amountLabel: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  logoMissing?: boolean;
};

export function AdminSponsorEditor({ row }: { row: Row }) {
  const [name, setName] = useState(row.sponsorName || "");
  const [url, setUrl] = useState(row.sponsorUrl || "");
  const [label, setLabel] = useState(row.pixelLabel || "");
  const [logo, setLogo] = useState(row.pixelImage || "");
  const [logoBroken, setLogoBroken] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onPickLogo(file: File | null) {
    if (!file) return;
    setStatus(null);
    try {
      const compressed = await compressLogo(file);
      setLogo(compressed.dataUrl);
      setLogoBroken(false);
      const res = await fetch("/api/pixels/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload mislukt");
      setLogo(data.url);
      setStatus("Logo geüpload — klik Opslaan.");
    } catch (err) {
      setLogo(row.pixelImage || "");
      setStatus(err instanceof Error ? err.message : "Upload mislukt");
    }
  }

  function save(clearLogo = false) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("paymentId", row.id);
      fd.set("sponsorName", name);
      fd.set("sponsorUrl", url);
      fd.set("pixelLabel", label);
      fd.set("pixelImage", clearLogo ? "" : logo);
      if (clearLogo) fd.set("clearLogo", "1");
      try {
        await updateSponsorPlacement(fd);
        if (clearLogo) {
          setLogo("");
          setLogoBroken(false);
        }
        setStatus(clearLogo ? "Logo verwijderd." : "Opgeslagen.");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Opslaan mislukt");
      }
    });
  }

  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg text-yellow">
            {row.sponsorName || "Sponsor"} · {row.sponsorTier || "—"} · {row.amountLabel}
          </p>
          <p className="mt-1 text-sm text-white/55">
            {row.email} · {row.phone || "geen gsm"} · {row.companyName || "geen bedrijf"}
          </p>
        </div>
        {logo && !logoBroken && !row.logoMissing ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={logo}
            src={logo}
            alt=""
            className="h-16 w-28 border border-white/15 object-cover"
            onError={() => setLogoBroken(true)}
          />
        ) : (
          <div className="flex h-16 w-28 flex-col items-center justify-center border border-dashed border-red-400/50 px-1 text-center text-[10px] text-red-300">
            {row.logoMissing ? "Logo weg — opnieuw uploaden" : "Geen / kapot logo"}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block text-xs uppercase tracking-widest text-muted">
          Naam op de site
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted">
          Website-link
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder="https://"
          />
        </label>
        <label className="block text-xs uppercase tracking-widest text-muted md:col-span-2">
          Ondertitel
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          />
        </label>
        <div className="md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted">Nieuw logo</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-2 block w-full text-sm"
            onChange={(e) => void onPickLogo(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-yellow" disabled={pending} onClick={() => save(false)}>
          Opslaan
        </button>
        <button type="button" className="btn-ghost" disabled={pending} onClick={() => save(true)}>
          Logo wissen
        </button>
        <form
          action={deletePayment}
          onSubmit={(e) => {
            if (
              !confirm(
                "Sponsor volledig wissen?\n\n• Logo-bestand\n• Bedrag uit de teller\n• Account (als er geen andere betalingen zijn)",
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="paymentId" value={row.id} />
          <button type="submit" className="btn-danger">
            Sponsor volledig wissen
          </button>
        </form>
      </div>
      {status ? <p className="mt-3 text-sm text-yellow">{status}</p> : null}
    </div>
  );
}
