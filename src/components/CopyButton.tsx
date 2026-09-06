"use client";

import { useState } from "react";

export function CopyButton({ url, label = "Kopieer link" }: { url: string; label?: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          window.prompt("Kopieer deze link", url);
        }
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      {done ? "Gekopieerd" : label}
    </button>
  );
}
