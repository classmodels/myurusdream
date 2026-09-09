"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { compressLogo } from "@/lib/compress-logo";
import { REACH_EXPLAIN, VISITOR_GOAL } from "@/lib/constants";
import type { ReachStats } from "@/lib/reach";
import { ShareButtons } from "@/components/ShareButtons";
import { useDict } from "@/lib/i18n/client";
import { prettyShareUrl } from "@/lib/share";

type Placement = {
  id: string;
  kind: string;
  sponsorName: string | null;
  sponsorUrl: string | null;
  sponsorTier: string | null;
  pixelImage: string | null;
  pixelLabel: string | null;
  amountCents: number;
  clickCount: number;
};

export function InvitationReach({
  reach,
  referralCode,
  preview = false,
}: {
  reach: ReachStats;
  referralCode: string;
  preview?: boolean;
}) {
  const dict = useDict();
  return (
    <div className="mt-12 space-y-6">
      <div className="card-dark p-6">
        <p className="font-display text-sm tracking-[0.28em] text-yellow">BEKIJK UW POPULARITEIT</p>
        <h2 className="mt-3 font-display text-3xl">Hoever reikt uw uitnodiging?</h2>
        <p className="mt-3 max-w-3xl text-white/75">{REACH_EXPLAIN}</p>
        <p className="mt-3 max-w-3xl text-white/70">
          Doel:{" "}
          <span className="text-yellow">{VISITOR_GOAL.toLocaleString("nl-BE")}</span> bezoekers op
          de site. Doe mee — zie hoeveel van uw rechtstreekse en onrechtstreekse contacten al
          meededen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Plaats in ranking" value={reach.rank ? `#${reach.rank}` : "—"} hint={`van ${reach.rankingSize}`} />
        <Stat label="Eerpunten totaal" value={String(reach.totalPoints)} hint="geen prijs — voor de eer" />
        <Stat
          label="Rechtstreeks bereikt"
          value={String(reach.directPeople)}
          hint={`+${reach.directPoints} pt via uw link`}
        />
        <Stat
          label="Via via in uw lijn"
          value={String(reach.indirectEvents)}
          hint={`+${reach.furtherPoints} pt dieper in de lijn`}
        />
      </div>

      <div className="card-dark p-6">
        <h3 className="font-display text-2xl">Nodig opnieuw uit</h3>
        <p className="mt-2 text-white/70">
          Eén link. Wie rechtstreeks stort via u: +2. Wie later via hen stort: +1 voor u. Zo ziet u
          hoe ver één uitnodiging kan reiken.
        </p>
        <p className="mt-3 text-sm lowercase text-yellow">{prettyShareUrl(referralCode)}</p>
        {!preview ? (
          <div className="mt-5">
            <ShareButtons
              referralCode={referralCode}
              shareText={dict.share.text}
              shareSubject={dict.share.subject}
              copyLabel="Kopieer mijn uitnodigingslink"
            />
          </div>
        ) : null}
        <p className="mt-4 text-sm text-white/55">
          Totaal in uw netwerk (schatting):{" "}
          <span className="text-yellow">{reach.totalPeopleEstimate}</span> bijdragen via directe +
          indirecte lijn.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card-dark p-5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-yellow">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

export function SponsorDashboardPanel({
  placements,
  preview = false,
}: {
  placements: Placement[];
  preview?: boolean;
}) {
  if (!placements.length) return null;

  return (
    <div className="mt-12 card-dark p-6">
      <p className="font-display text-sm tracking-[0.28em] text-yellow">SPONSOR-ACCOUNT</p>
      <h2 className="mt-3 font-display text-3xl">Uw reclame opvolgen</h2>
      <p className="mt-3 max-w-3xl text-white/75">
        Als sponsor hebt u automatisch een dashboard-account. Wijzig hier uw logo of website-link en
        zie hoeveel bezoekers via uw vak naar uw site gingen.
      </p>
      <ul className="mt-6 space-y-6">
        {placements.map((p) => (
          <SponsorPlacementEditor key={p.id} placement={p} preview={preview} />
        ))}
      </ul>
    </div>
  );
}

function SponsorPlacementEditor({
  placement,
  preview,
}: {
  placement: Placement;
  preview: boolean;
}) {
  const [logo, setLogo] = useState(placement.pixelImage);
  const [url, setUrl] = useState(placement.sponsorUrl || "");
  const [label, setLabel] = useState(placement.pixelLabel || "");
  const [clicks, setClicks] = useState(placement.clickCount);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function uploadLogo(file: File | null) {
    if (!file || preview) return;
    setBusy(true);
    setStatus(null);
    try {
      const compressed = await compressLogo(file);
      setLogo(compressed.dataUrl);
      const res = await fetch("/api/pixels/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: compressed.dataUrl }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload mislukt");
      setLogo(data.url);
      await save({ pixelImage: data.url });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function save(patch: { pixelImage?: string; sponsorUrl?: string; pixelLabel?: string }) {
    if (preview) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sponsor/placement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: placement.id, ...patch }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Opslaan mislukt");
      setStatus("Opgeslagen.");
      setClicks(placement.clickCount);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Opslaan mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="border border-white/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-yellow">
            {placement.sponsorName || "Sponsor"} · {placement.sponsorTier || placement.kind}
          </p>
          <p className="mt-1 text-sm text-white/60">{formatCents(placement.amountCents)}</p>
          <p className="mt-2 text-sm text-white/80">
            Kliks naar uw website: <span className="text-yellow">{clicks}</span>
          </p>
          <p className="mt-1 text-xs text-white/45">
            Track-link:{" "}
            <Link href={`/api/go/sponsor/${placement.id}`} className="text-yellow underline">
              /api/go/sponsor/{placement.id}
            </Link>
          </p>
        </div>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-20 w-32 object-cover border border-white/10" />
        ) : (
          <div className="flex h-20 w-32 items-center justify-center border border-white/10 text-xs text-white/40">
            Geen logo
          </div>
        )}
      </div>

      {!preview ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted">Logo wijzigen</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              className="mt-2 block w-full text-sm"
              onChange={(e) => void uploadLogo(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted">Website-URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
              placeholder="https://"
            />
            <button
              type="button"
              disabled={busy}
              className="btn-ghost mt-2"
              onClick={() => void save({ sponsorUrl: url, pixelLabel: label })}
            >
              URL opslaan
            </button>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs uppercase tracking-widest text-muted">Ondertitel</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-black/40 px-3 py-2 text-white"
              maxLength={80}
            />
          </div>
        </div>
      ) : null}
      {status ? <p className="mt-3 text-sm text-yellow">{status}</p> : null}
    </li>
  );
}
