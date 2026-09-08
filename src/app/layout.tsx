import type { Metadata, Viewport } from "next";
import { Great_Vibes, Oswald, Outfit } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { CaptureReferral } from "@/components/CaptureReferral";
import { TrackVisit } from "@/components/TrackVisit";
import { PushAsk } from "@/components/PushAsk";
import { SITE_NAME } from "@/lib/constants";
import { siteUrl } from "@/lib/mollie";
import { getSessionUser } from "@/lib/auth";
import { campaignShareMetadata } from "@/lib/share-meta";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { localeHtmlLang } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/client";
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

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const url = siteUrl();
  const dict = await getDictionary();
  return {
    metadataBase: new URL(url),
    title: {
      default: `${SITE_NAME} | ${dict.meta.tagline}`,
      template: `%s | ${SITE_NAME}`,
    },
    ...campaignShareMetadata(url),
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
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return (
    <html
      lang={localeHtmlLang(locale)}
      className={`${oswald.variable} ${outfit.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-white">
        <I18nProvider locale={locale} dict={dict}>
          <Header loggedIn={Boolean(participant)} />
          <CaptureReferral />
          <TrackVisit />
          <PushAsk />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <span className="sr-only">{dict.lamborghini}</span>
        </I18nProvider>
      </body>
    </html>
  );
}
