import type { Metadata } from "next";
import { Bebas_Neue, Literata } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Literata({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Zetormuseum | Oldtimertractoren in Houtvenne",
    template: "%s | Zetormuseum",
  },
  description:
    "Paradijs voor liefhebbers van landbouwmachines en oldtimertractoren. Unieke Zetor-collectie van Herman Michiels in Houtvenne — enkel op afspraak voor groepen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
