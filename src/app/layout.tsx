import type { Metadata, Viewport } from "next";
import { Oswald, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { CaptureReferral } from "@/components/CaptureReferral";
import { SITE_NAME, TAGLINE, LAMBORGHINI_DISCLAIMER } from "@/lib/constants";
import { siteUrl } from "@/lib/mollie";
import { getSessionUser } from "@/lib/auth";
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

const url = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: {
    default: `${SITE_NAME} | €2 voor een droom`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Kunnen 200.000 mensen met een bijdrage van €2 samen één uitzonderlijke autodroom mogelijk maken? Volg de campagne volledig transparant.",
  openGraph: {
    title: `${SITE_NAME} | €2 voor een droom`,
    description:
      "Kunnen 200.000 mensen met een bijdrage van €2 samen één uitzonderlijke autodroom mogelijk maken? Volg de campagne volledig transparant.",
    url,
    siteName: SITE_NAME,
    locale: "nl_BE",
    type: "website",
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: TAGLINE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | €2 voor een droom`,
    description: TAGLINE,
    images: ["/images/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const participant = await getSessionUser("participant");
  return (
    <html lang="nl" className={`${oswald.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-white">
        <Header loggedIn={Boolean(participant)} />
        <CaptureReferral />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <span className="sr-only">{LAMBORGHINI_DISCLAIMER}</span>
      </body>
    </html>
  );
}
