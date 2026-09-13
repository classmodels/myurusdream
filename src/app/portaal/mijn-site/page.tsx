import type { Metadata } from "next";
import { PortalClientSite } from "@/components/portal/PortalClientSite";

export const metadata: Metadata = {
  title: "Mijn website",
  robots: { index: false, follow: false },
};

export default function PortaalMijnSitePage() {
  return <PortalClientSite />;
}
