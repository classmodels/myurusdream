import { createMollieClient } from "@mollie/api-client";

export function mollieConfigured() {
  const key = process.env.MOLLIE_API_KEY?.trim();
  return Boolean(key && key.startsWith("test_"));
}

export function getMollie() {
  const key = process.env.MOLLIE_API_KEY?.trim();
  if (!key) throw new Error("MOLLIE_API_KEY ontbreekt");
  if (!key.startsWith("test_")) {
    throw new Error("Alleen Mollie TEST-sleutels (test_...) zijn toegestaan in deze versie.");
  }
  return createMollieClient({ apiKey: key });
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001").replace(
    /\/$/,
    "",
  );
}
