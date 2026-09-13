"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PreviewRoom } from "@/components/PreviewRoom";
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

  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-14">
        <p className="eyebrow">Uw account</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink md:text-4xl">
          {session.title}
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Hier volgt u de website terwijl SiteButler eraan werkt. Live adres:{" "}
          <Link href={`/portaal/${session.publicSlug}`} className="font-semibold text-teal hover:underline">
            /portaal/{session.publicSlug}
          </Link>
        </p>
        <div className="mt-8">
          <PreviewRoom slug={session.slug} title={session.title} initialCode={session.accessCode} />
        </div>
      </div>
    </section>
  );
}

