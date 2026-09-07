"use client";

import { useEffect, useState } from "react";
import { isStandaloneApp, registerPush } from "@/lib/register-push";

export function PushSetup() {
  const [status, setStatus] = useState<"idle" | "need-app" | "off" | "on" | "blocked" | "fail">("idle");
  const [iphone, setIphone] = useState(false);

  useEffect(() => {
    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIphone(ios);
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus(ios && !isStandaloneApp() ? "need-app" : "blocked");
      return;
    }
    if (ios && !isStandaloneApp()) {
      setStatus("need-app");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    if (Notification.permission === "granted") {
      registerPush()
        .then((ok) => setStatus(ok ? "on" : "fail"))
        .catch(() => setStatus("fail"));
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
      if (ok) {
        try {
          new Notification("Meldingen staan aan", {
            body: "Dit is hoe een bericht eruitziet.",
            icon: "/3.png",
          });
        } catch {
          /* ignore */
        }
        if (navigator.setAppBadge) navigator.setAppBadge(1).catch(() => undefined);
      }
      setStatus(ok ? "on" : "fail");
    } catch {
      setStatus("fail");
    }
  }

  return (
    <div className="card-dark space-y-3 p-5 text-left">
      <p className="font-display text-xl text-yellow">Berichten op uw gsm</p>
      {status === "need-app" ? (
        <p className="text-white/80">
          Op iPhone: tik op Delen (vierkant met pijl) → Zet op beginscherm. Open daarna <b>dat icoon</b>, niet
          Safari. Bij de eerste opening vraagt de app of u meldingen wilt. Tik dan Ja — Apple vraagt dat niet
          automatisch alleen omdat het icoon er staat.
        </p>
      ) : null}
      {status === "off" || status === "fail" ? (
        <>
          {iphone ? (
            <p className="text-sm text-white/70">
              Open de site via het icoon op het beginscherm, daarna deze knop.
            </p>
          ) : null}
          <button type="button" className="btn-yellow" onClick={enable}>
            Zet meldingen aan
          </button>
        </>
      ) : null}
      {status === "on" ? (
        <p className="text-white/80">Meldingen staan aan. U krijgt een testbericht. Kijk op het icoon naar een 1.</p>
      ) : null}
      {status === "blocked" ? (
        <p className="text-white/70">Meldingen zijn geblokkeerd in de instellingen van deze telefoon.</p>
      ) : null}
    </div>
  );
}
