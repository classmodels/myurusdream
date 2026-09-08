import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import type { Dictionary } from "./dictionary";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : defaultLocale;
}

export async function getDictionary(locale?: Locale): Promise<Dictionary> {
  const l = locale ?? (await getLocale());
  if (l === "en") return (await import("@/messages/en.json")).default as Dictionary;
  if (l === "fr") return (await import("@/messages/fr.json")).default as Dictionary;
  return (await import("@/messages/nl.json")).default as Dictionary;
}
