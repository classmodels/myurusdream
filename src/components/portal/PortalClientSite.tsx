"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadClientSiteSession } from "@/lib/client-site-session";

export function PortalClientSite() {
  const [session, setSession] = useState<ReturnType<typeof loadClientSiteSession>>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(loadClientSiteSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!session) {
    return (
      <section className="mesh-hero">
        <div className="container-x py-16">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
            Meld u aan om uw website te zien
          </h1>
          <Link href="/portaal" className="btn-primary mt-6 inline-flex text-sm">
            Naar het portaal
          </Link>
        </div>
      </section>
    );
  }

  const liveHref = session.liveSitePath;

  return (
    <section className="mesh-hero">
      <div className="container-x py-8 md:py-10">
        <p className="eyebrow">Uw website</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
            {session.title}
          </h1>
          {liveHref ? (
            <a href={liveHref} className="btn-soft !px-4 !py-2 text-sm">
              Open in nieuw tabblad
            </a>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Dit is de site waaraan SiteButler voor u werkt.
        </p>
        {liveHref ? (
          <div className="mt-6 overflow-hidden rounded-tr-2xl ring-1 ring-line">
            <iframe title={session.title} src={liveHref} className="h-[80vh] w-full bg-white" />
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-line bg-white p-5 text-sm text-ink-soft">
            Er is nog geen live site aan uw login gekoppeld. SiteButler zet dit zo voor u klaar.
          </p>
        )}
      </div>
    </section>
  );
}
