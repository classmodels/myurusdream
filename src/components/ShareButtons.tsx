"use client";

import { useState } from "react";
import { shareLinks } from "@/lib/share";
import { CopyButton } from "./CopyButton";

export function ShareButtons({
  referralCode,
  shareText,
  shareSubject,
  className,
  stacked = false,
  compact = false,
  copyLabel,
}: {
  referralCode?: string | null;
  shareText: string;
  shareSubject: string;
  className?: string;
  stacked?: boolean;
  compact?: boolean;
  copyLabel?: string;
}) {
  const links = shareLinks(referralCode, { text: shareText, subject: shareSubject });
  const [hint, setHint] = useState("");

  async function copyAndOpen(href: string, name: string) {
    try {
      await navigator.clipboard.writeText(links.text);
      setHint(`Tekst gekopieerd — plak in ${name}`);
    } catch {
      window.prompt("Kopieer deze tekst", links.text);
    }
    window.open(href, "_blank", "noreferrer");
    setTimeout(() => setHint(""), 4000);
  }

  return (
    <div>
      <div
        className={`${compact ? "share-row-compact" : ""} flex gap-2 ${
          stacked ? "flex-col" : "flex-wrap items-center"
        } ${className ?? (stacked ? "" : "justify-center")}`}
      >
        <a className="btn-yellow" href={links.whatsapp} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.facebook, "Facebook")}>
          Facebook
        </button>
        <a className="btn-ghost" href={links.email}>
          E-mail
        </a>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.instagram, "Instagram")}>
          Instagram
        </button>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.tiktok, "TikTok")}>
          TikTok
        </button>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.snapchat, "Snapchat")}>
          Snapchat
        </button>
        <CopyButton url={links.url} label={copyLabel ?? (referralCode ? "Kopieer mijn link" : "Kopieer campagne")} />
      </div>
      {hint ? <p className="mt-2 text-xs text-yellow">{hint}</p> : null}
    </div>
  );
}
