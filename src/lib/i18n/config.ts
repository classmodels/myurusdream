export const locales = ["nl", "en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";
export const LOCALE_COOKIE = "myurusdream_lang";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "nl" || value === "en" || value === "fr";
}

export function localeHtmlLang(locale: Locale): string {
  if (locale === "en") return "en";
  if (locale === "fr") return "fr";
  return "nl";
}

export function localeNumberTag(locale: Locale): string {
  if (locale === "en") return "en-GB";
  if (locale === "fr") return "fr-BE";
  return "nl-BE";
}
