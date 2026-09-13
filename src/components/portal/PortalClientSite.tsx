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

  const liveHref = session?.liveSitePath || "/portaal/myurusdream";
  const title = session?.title || "Uw website";

  return (
    <section className="mesh-hero">
      <div className="container-x py-8 md:py-10">
        <p className="eyebrow">Uw website</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-ink">
            {title}
          </h1>
          <a href={liveHref} className="btn-soft !px-4 !py-2 text-sm">
            Open in nieuw tabblad
          </a>
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Dit is de site waaraan SiteButler voor u werkt.{" "}
          <Link href="/portaal/project" className="font-semibold text-teal hover:underline">
            Naar het stappenplan
          </Link>
        </p>
        <div className="mt-6 overflow-hidden rounded-tr-2xl ring-1 ring-line">
          <iframe title={title} src={liveHref} className="h-[80vh] w-full bg-white" />
        </div>
      </div>
    </section>
  );
}
