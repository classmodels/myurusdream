import type { Metadata } from "next";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata: Metadata = {
  title: "Mijn project",
  description: "Projectvoortgang, uploads, contract en feedback in het SitePilot-klantportaal.",
};

export default function PortaalProjectPage() {
  return <PortalDashboard />;
}
