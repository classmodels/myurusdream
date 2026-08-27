import type { Metadata } from "next";
import { Oswald, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { SITE_NAME, TAGLINE, LAMBORGHINI_DISCLAIMER } from "@/lib/constants";
import { siteUrl } from "@/lib/mollie";
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
    default: "€2 voor een droom | Lamborghini Urus Project",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Kunnen 200.000 mensen met een bijdrage van €2 samen één uitzonderlijke autodroom mogelijk maken? Volg de campagne volledig transparant.",
  openGraph: {
    title: "€2 voor een droom | Lamborghini Urus Project",
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
    title: "€2 voor een droom | Lamborghini Urus Project",
    description: TAGLINE,
    images: ["/images/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${oswald.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <span className="sr-only">{LAMBORGHINI_DISCLAIMER}</span>
      </body>
    </html>
  );
}
