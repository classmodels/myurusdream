"use client";

import { useEffect, useRef, useState } from "react";
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
  const [facebookOpen, setFacebookOpen] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!facebookOpen) return;
    void copyShareText();
    const box = textRef.current;
    if (box) {
      box.focus();
      box.select();
    }
  }, [facebookOpen]);

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(links.text);
      return true;
    } catch {
      return false;
    }
  }

  async function copyAndOpen(href: string, name: string) {
    const ok = await copyShareText();
    if (ok) {
      setHint(`Tekst gekopieerd — plak in ${name} (Cmd+V of Ctrl+V)`);
    } else {
      window.prompt("Kopieer deze tekst", links.text);
    }
    window.open(href, "_blank", "noreferrer");
    setTimeout(() => setHint(""), 6000);
  }

  async function shareFacebook() {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (mobile && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareText, text: shareText, url: links.url });
        return;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
      }
    }
    setFacebookOpen(true);
  }

  async function openFacebook() {
    await copyShareText();
    window.open(links.facebook, "_blank", "noreferrer,width=640,height=720");
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
        <button type="button" className="btn-ghost" onClick={() => void shareFacebook()}>
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

      {facebookOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 p-4 sm:items-center"
          onClick={() => setFacebookOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-yellow/40 bg-black p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-2xl text-yellow">Facebook</p>
            <p className="mt-3 text-sm text-white/80">
              Facebook zet de tekst niet zelf in het vak bovenaan. Kopieer hieronder, open Facebook,
              klik in het lege vak boven de foto en plak (Cmd+V of Ctrl+V). Dan staat de hele tekst
              boven de foto.
            </p>
            <textarea
              ref={textRef}
              readOnly
              rows={6}
              className="mt-4 w-full resize-none bg-white/5 p-3 text-sm text-white"
              value={links.text}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="btn-yellow" onClick={() => void openFacebook()}>
                Open Facebook
              </button>
              <button type="button" className="btn-ghost" onClick={() => setFacebookOpen(false)}>
                Sluiten
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
