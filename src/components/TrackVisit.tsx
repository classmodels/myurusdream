"use client";

import { useEffect } from "react";
import { registerPush } from "@/lib/register-push";

export function TrackVisit() {
  useEffect(() => {
    const ping = () => fetch("/api/visit", { method: "POST" }).catch(() => undefined);
    ping();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") ping();
    }, 25000);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => undefined);
    }
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      registerPush().catch(() => undefined);
    }
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  return null;
}
