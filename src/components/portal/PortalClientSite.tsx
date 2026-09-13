"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearClientSiteSession, loadClientSiteSession } from "@/lib/client-site-session";

export function PortalClientSite() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof loadClientSiteSession>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = loadClientSiteSession();
    setSession(current);
    setReady(true);
    if (!current?.liveSitePath) {
      router.replace("/portaal");
    }
  }, [router]);

  if (!ready || !session?.liveSitePath) return null;

  function logout() {
    clearClientSiteSession();
    router.replace("/portaal");
  }

  return (
    <div className="bg-bg">
      <div className="border-b border-line bg-bg-alt">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-teal uppercase">Uw portaal</p>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">{session.title}</h1>
          </div>
          <button type="button" onClick={logout} className="btn-secondary !px-3 !py-2 text-xs">
            Uitloggen
          </button>
        </div>
      </div>
      <iframe title={session.title} src={session.liveSitePath} className="h-[calc(100dvh-4.5rem)] w-full bg-white" />
    </div>
  );
}
