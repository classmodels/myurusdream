"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-sm border border-white/15 bg-black/40 p-0.5"
      role="group"
      aria-label={dict.lang.label}
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => choose(code)}
            className={`px-1.5 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.14em] transition ${
              active ? "bg-yellow text-black" : "text-white/70 hover:text-yellow"
            }`}
            aria-pressed={active}
            title={dict.lang[code]}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
