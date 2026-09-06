"use client";

import { useEffect } from "react";
import { registerPush } from "@/lib/register-push";

export function TrackVisit() {
  useEffect(() => {
    fetch("/api/visit", { method: "POST" }).catch(() => undefined);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => undefined);
    }
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      registerPush().catch(() => undefined);
    }
  }, []);
  return null;
}
