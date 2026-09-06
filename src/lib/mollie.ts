import { createMollieClient } from "@mollie/api-client";
import { decryptSecret } from "./secret-box";
import { getSetting } from "./settings";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001").replace(
    /\/$/,
    "",
  );
}

export async function getMollieApiKey() {
  const stored = await getSetting("mollie_api_key");
  if (stored) {
    try {
      const key = decryptSecret(stored).trim();
      if (key) return key;
    } catch {
      /* fall through to env */
    }
  }
  return process.env.MOLLIE_API_KEY?.trim() || "";
}

export async function getMollieWebhookUrl() {
  const stored = (await getSetting("mollie_webhook_url"))?.trim();
  if (stored) return stored;
  const env = process.env.MOLLIE_WEBHOOK_URL?.trim();
  if (env) return env;
  return `${siteUrl()}/api/webhooks/mollie`;
}

export function isMollieKey(key: string) {
  return key.startsWith("test_") || key.startsWith("live_");
}

export async function mollieConfigured() {
  const key = await getMollieApiKey();
  return isMollieKey(key);
}

export async function getMollie() {
  const key = await getMollieApiKey();
  if (!isMollieKey(key)) {
    throw new Error("Mollie-sleutel ontbreekt. Zet die in het admin-dashboard.");
  }
  return createMollieClient({ apiKey: key });
}
