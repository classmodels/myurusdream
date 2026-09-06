"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

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
      enable().then(() => setStatus("on")).catch(() => setStatus("on"));
      return;
    }
    setStatus("off");
  }, []);

  async function enable() {
    try {
      await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("blocked");
        return;
      }
      const res = await fetch("/api/push/vapid");
      const { key } = await res.json();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus("on");
    } catch {
      setStatus("blocked");
    }
  }

  if (status === "idle" || status === "on" || status === "blocked") return null;

  return (
    <button
      type="button"
      onClick={enable}
      className="whitespace-nowrap text-xs uppercase tracking-[0.14em] text-white/75 hover:text-yellow"
    >
      Meldingen
    </button>
  );
}
