"use client";

import { useEffect, useState } from "react";
import { registerPush } from "@/lib/register-push";

export function PushEnable() {
  const [status, setStatus] = useState<"idle" | "on" | "off" | "blocked">("idle");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("blocked");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    if (Notification.permission === "granted") {
      registerPush()
        .then((ok) => setStatus(ok ? "on" : "off"))
        .catch(() => setStatus("off"));
      return;
    }
    setStatus("off");
  }, []);

  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("blocked");
        return;
      }
      const ok = await registerPush();
      setStatus(ok ? "on" : "blocked");
    } catch {
      setStatus("blocked");
    }
  }

  if (status === "idle" || status === "blocked") return null;
  if (status === "on") {
    return (
      <span className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-white/45">
        Meldingen aan
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-yellow hover:text-white"
    >
      Zet meldingen aan
    </button>
  );
}
