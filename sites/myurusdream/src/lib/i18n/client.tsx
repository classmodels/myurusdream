"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dictionary } from "./dictionary";
import type { Locale } from "./config";
import { defaultLocale } from "./config";

type I18nValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useDict() {
  return useI18n().dict;
}

/** Safe for components that may render outside provider during edge cases */
export function useDictOptional(): Dictionary | null {
  return useContext(I18nContext)?.dict ?? null;
}

export function useLocale(): Locale {
  return useI18n().locale ?? defaultLocale;
}
