import type { Metadata, Viewport } from "next";
import { Oswald, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { CaptureReferral } from "@/components/CaptureReferral";
import { TrackVisit } from "@/components/TrackVisit";
import { PushAsk } from "@/components/PushAsk";
import { SITE_NAME, LAMBORGHINI_DISCLAIMER } from "@/lib/constants";
import { siteUrl } from "@/lib/mollie";
import { getSessionUser } from "@/lib/auth";
import { socialShareMetadata } from "@/lib/share-meta";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const url = siteUrl();
  const social = await socialShareMetadata(url);
  return {
    metadataBase: new URL(url),
    title: {
      default: `${SITE_NAME} | €2 voor een droom`,
      template: `%s | ${SITE_NAME}`,
    },
    ...social,
    robots: { index: true, follow: true },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      title: SITE_NAME,
      statusBarStyle: "black-translucent",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const participant = await getSessionUser("participant");
  return (
    <html lang="nl" className={`${oswald.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-white">
        <Header loggedIn={Boolean(participant)} />
        <CaptureReferral />
        <TrackVisit />
        <PushAsk />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <span className="sr-only">{LAMBORGHINI_DISCLAIMER}</span>
      </body>
    </html>
  );
}
