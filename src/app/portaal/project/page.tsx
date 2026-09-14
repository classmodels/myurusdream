import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata: Metadata = {
  title: "Mijn project",
  description: "Projectvoortgang, uploads, contract en feedback in het SiteButler-klantportaal.",
};

export default function PortaalProjectPage() {
  return (
    <Suspense fallback={<div className="container-x py-20 text-sm text-ink-soft">Portaal laden…</div>}>
      <PortalDashboard />
    </Suspense>
  );
}
