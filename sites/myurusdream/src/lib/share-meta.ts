import type { Metadata } from "next";
import { SITE_NAME, TAGLINE } from "./constants";

const DESCRIPTION =
  "Kunnen 200.000 mensen met een bijdrage van €2 samen één uitzonderlijke autodroom mogelijk maken? Volg de campagne volledig transparant.";

export function campaignShareMetadata(canonicalUrl: string): Metadata {
  return {
    description: DESCRIPTION,
    openGraph: {
      title: `${SITE_NAME} | €2 voor een droom`,
      description: DESCRIPTION,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "nl_BE",
      type: "website",
      images: [{ url: "/5.png", width: 1200, height: 630, alt: TAGLINE }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | €2 voor een droom`,
      description: TAGLINE,
      images: ["/5.png"],
    },
  };
}
