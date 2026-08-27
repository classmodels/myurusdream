import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/mollie";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
