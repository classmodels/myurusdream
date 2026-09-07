import type { Metadata } from "next";
import { SITE_NAME } from "./constants";
import { getShareCopy } from "./share";

export async function socialShareMetadata(canonicalUrl: string): Promise<Metadata> {
  const copy = await getShareCopy();
  return {
    description: copy.text,
    openGraph: {
      title: copy.text,
      description: copy.text,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "nl_BE",
      type: "website",
      images: [{ url: "/5.png", width: 1200, height: 630, alt: copy.text }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.text,
      description: copy.text,
      images: ["/5.png"],
    },
  };
}
