import type { Metadata } from "next";
import { PortalHome } from "@/components/portal/PortalHome";

export const metadata: Metadata = {
  title: "Klantportaal",
  description: "Log in om de website te zien waar SiteButler aan werkt.",
};

export default function PortaalLoginPage() {
  return <PortalHome />;
}
