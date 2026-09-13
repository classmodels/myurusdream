"use client";

import { useEffect } from "react";

const prefix = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function PatchBasePath() {
  useEffect(() => {
    if (!prefix || window.__sitebutlerBasePathPatched) return;
    window.__sitebutlerBasePathPatched = true;

    const origFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (typeof input === "string" && input.startsWith("/") && !input.startsWith(prefix)) {
        if (
          input.startsWith("/api") ||
          input.startsWith("/uploads") ||
          input.startsWith("/_next") ||
          input.startsWith("/manifest")
        ) {
          input = `${prefix}${input}`;
        }
      }
      return origFetch(input, init);
    };

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const a = target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("/") || href.startsWith(prefix) || href.startsWith("//")) return;
        if (href.startsWith("/api") || href.startsWith("/uploads")) {
          a.setAttribute("href", `${prefix}${href}`);
        }
      },
      true,
    );
  }, []);

  return null;
}

declare global {
  interface Window {
    __sitebutlerBasePathPatched?: boolean;
  }
}
