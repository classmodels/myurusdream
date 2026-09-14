"use client";

import { useEffect } from "react";

const prefix = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

function needsPrefix(url: string) {
  if (!url.startsWith("/") || url.startsWith(prefix) || url.startsWith("//")) return false;
  return (
    url.startsWith("/api") ||
    url.startsWith("/uploads") ||
    url.startsWith("/_next") ||
    url.startsWith("/images") ||
    url.startsWith("/manifest") ||
    /\.(png|jpe?g|webp|gif|svg|ico)(\?|$)/i.test(url)
  );
}

function withPrefix(url: string) {
  return needsPrefix(url) ? `${prefix}${url}` : url;
}

export function PatchBasePath() {
  useEffect(() => {
    if (!prefix || window.__sitebutlerBasePathPatched) return;
    window.__sitebutlerBasePathPatched = true;

    const origFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      if (typeof input === "string" && needsPrefix(input)) {
        input = withPrefix(input);
      }
      return origFetch(input, init);
    };

    const rewriteNode = (node: Element) => {
      if (node instanceof HTMLImageElement) {
        const src = node.getAttribute("src");
        if (src && needsPrefix(src)) node.setAttribute("src", withPrefix(src));
      }
      if (node instanceof HTMLLinkElement) {
        const href = node.getAttribute("href");
        if (href && needsPrefix(href)) node.setAttribute("href", withPrefix(href));
      }
    };

    document.querySelectorAll("img[src], link[href]").forEach(rewriteNode);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          rewriteNode(node);
          node.querySelectorAll?.("img[src], link[href]").forEach(rewriteNode);
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const a = target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href");
        if (!href || !needsPrefix(href)) return;
        a.setAttribute("href", withPrefix(href));
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
