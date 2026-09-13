"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadClientSiteSession } from "@/lib/client-site-session";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";

export function PortalHome() {
  const router = useRouter();

  useEffect(() => {
    if (loadClientSiteSession()?.liveSitePath) {
      router.replace("/portaal/mijn-site");
    }
  }, [router]);

  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="eyebrow">Klantportaal</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
              Log in. Daarna ziet u uw website.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">
              De site waar SiteButler aan werkt, staat in uw portaal.
            </p>
          </div>
          <PortalLoginForm />
        </div>
      </div>
    </section>
  );
}
