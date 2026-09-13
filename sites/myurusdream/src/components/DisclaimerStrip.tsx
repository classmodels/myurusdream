"use client";

import { useDict } from "@/lib/i18n/client";

export function DisclaimerStrip() {
  const dict = useDict();
  return (
    <div className="border-y border-yellow/20 bg-yellow text-black">
      <div className="mx-auto max-w-7xl px-5 py-3">
        <p className="font-display text-xl tracking-[0.14em] md:text-2xl lg:text-3xl">
          {dict.disclaimer.strip}
        </p>
      </div>
    </div>
  );
}
