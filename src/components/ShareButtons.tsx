"use client";

import { useState } from "react";
import { shareLinks } from "@/lib/share";
import { CopyButton } from "./CopyButton";
import { useDict } from "@/lib/i18n/client";

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
  const dict = useDict();
  const links = shareLinks(referralCode, { text: shareText, subject: shareSubject });
  const [hint, setHint] = useState("");

  async function copyAndOpen(href: string, name: string) {
    try {
      await navigator.clipboard.writeText(links.text);
      setHint(dict.share.copiedPaste.replace("{name}", name));
    } catch {
      window.prompt(dict.share.copy, links.text);
    }
    window.open(href, "_blank", "noreferrer");
    setTimeout(() => setHint(""), 4000);
  }

  return (
    <div>
      <div
        className={`${compact ? "share-row-compact" : ""} ${
          stacked ? "flex flex-col gap-2" : "share-grid"
        } ${className ?? (stacked ? "" : "justify-center")}`}
      >
        <a className="btn-yellow" href={links.whatsapp} target="_blank" rel="noreferrer">
          {dict.share.whatsapp}
        </a>
        <a className="btn-ghost" href={links.facebook} target="_blank" rel="noreferrer">
          {dict.share.facebook}
        </a>
        <a className="btn-ghost" href={links.email}>
          {dict.share.email}
        </a>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.instagram, dict.share.instagram)}>
          {dict.share.instagram}
        </button>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.tiktok, dict.share.tiktok)}>
          {dict.share.tiktok}
        </button>
        <button type="button" className="btn-ghost" onClick={() => copyAndOpen(links.snapchat, dict.share.snapchat)}>
          {dict.share.snapchat}
        </button>
        <CopyButton
          url={links.url}
          label={copyLabel ?? (referralCode ? dict.share.copyMine : dict.share.copy)}
        />
      </div>
      {hint ? <p className="mt-2 text-xs text-yellow">{hint}</p> : null}
    </div>
  );
}
