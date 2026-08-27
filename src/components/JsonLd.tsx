import { SITE_NAME, TAGLINE } from "@/lib/constants";
import { siteUrl } from "@/lib/mollie";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    description: TAGLINE,
    inLanguage: "nl-BE",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
