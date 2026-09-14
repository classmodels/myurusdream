import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Klant aan site koppelen",
  robots: { index: false, follow: false },
};

/** Oude URL — doorverwijzen naar admin backstage */
export default function PortaalKoppelenPage() {
  redirect("/portaal/admin");
}
