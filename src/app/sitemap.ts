import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/mollie";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = [
    "",
    "/meedoen",
    "/sponsor-worden",
    "/sponsors",
    "/koop-pixels",
    "/pixels",
    "/volg-alles",
    "/faq",
    "/voorwaarden",
    "/campagnevoorwaarden",
    "/privacy",
    "/cookies",
    "/contact",
    "/disclaimer",
    "/terugbetaling",
    "/winactie-voorwaarden",
  ];
  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
}
