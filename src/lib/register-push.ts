"use client";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function keyToB64(key: ArrayBuffer | null) {
  if (!key) return "";
  const bytes = new Uint8Array(key);
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

let inflight: Promise<boolean> | null = null;

export async function registerPush(options?: { sendTest?: boolean }) {
  if (inflight) return inflight;
  inflight = registerPushOnce(options).finally(() => {
    inflight = null;
  });
  return inflight;
}

async function registerPushOnce(options?: { sendTest?: boolean }) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return false;
  }
  const reg = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
  await navigator.serviceWorker.ready;
  if (Notification.permission !== "granted") return false;
  const res = await fetch("/api/push/vapid");
  const { key } = await res.json();
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  const payload = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: keyToB64(sub.getKey("p256dh")),
      auth: keyToB64(sub.getKey("auth")),
    },
  };
  const saved = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!saved.ok) return false;
  if (options?.sendTest && localStorage.getItem("myurusdream_push_tested") !== "1") {
    localStorage.setItem("myurusdream_push_tested", "1");
    await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => undefined);
  }
  return true;
}
