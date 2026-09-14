import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata: Metadata = {
  title: "Mijn website",
  robots: { index: false, follow: false },
};

export default function PortaalMijnSitePage() {
  return (
    <Suspense fallback={<div className="container-x py-20 text-sm text-ink-soft">Portaal laden…</div>}>
      <PortalDashboard />
    </Suspense>
  );
}
