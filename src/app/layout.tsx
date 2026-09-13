import type { Metadata, Viewport } from "next";
import { Manrope, Source_Sans_3 } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sitebutler.be"),
  title: {
    default: "SiteButler | Professionele websites voor elke branche",
    template: "%s | SiteButler",
  },
  description:
    "SiteButler ontwikkelt professionele websites voor KMO's en organisaties. Inclusief logo, teksten, fotografie en video. Offerte binnen 24 uur. Vanaf €1.250.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
