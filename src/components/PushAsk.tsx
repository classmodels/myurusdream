"use client";

import { useEffect, useState } from "react";
import { isStandaloneApp, registerPush } from "@/lib/register-push";

export function PushAsk() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("myurusdream_push_asked") === "1") return;
    const standalone = isStandaloneApp();
    if (!standalone) return;
    if (!("Notification" in window) || Notification.permission !== "default") return;
    setShow(true);
  }, []);

  async function yes() {
    try {
      const perm = await Notification.requestPermission();
      localStorage.setItem("myurusdream_push_asked", "1");
      if (perm === "granted") {
        await registerPush();
        if (navigator.setAppBadge) navigator.setAppBadge(1).catch(() => undefined);
      }
    } catch {
      localStorage.setItem("myurusdream_push_asked", "1");
    }
    setShow(false);
  }

  function later() {
    localStorage.setItem("myurusdream_push_asked", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-5 sm:items-center">
      <div className="w-full max-w-md border border-yellow/40 bg-black p-6">
        <p className="font-display text-2xl text-yellow">Meldingen aanzetten?</p>
        <p className="mt-3 text-white/80">
          Je hebt het icoon op je startscherm gezet. Tik <strong>Ja, aanzetten</strong> om berichten
          te ontvangen (Apple vraagt daarna nog eens om te bevestigen). Zonder die tik komen er geen
          meldingen.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-yellow" onClick={yes}>
            Ja, aanzetten
          </button>
          <button type="button" className="btn-ghost" onClick={later}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
