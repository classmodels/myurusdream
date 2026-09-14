import type { Metadata } from "next";
import { PortalDashboard } from "@/components/portal/PortalDashboard";

export const metadata: Metadata = {
  title: "Mijn website",
  robots: { index: false, follow: false },
};

export default function PortaalMijnSitePage() {
  return <PortalDashboard />;
}
