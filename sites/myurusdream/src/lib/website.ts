const STRIP = /[\s\u00a0\u1680\u2000-\u200d\u202f\u205f\u3000\ufeff]+/g;

export function normalizeWebsiteUrl(raw: string): string | null {
  let value = raw.trim().replace(STRIP, "");
  if (!value) return null;

  value = value.replace(/^https?:\/\//i, "");
  value = value.replace(/^\/\//, "");
  value = value.replace(/^www:\/*/i, "www.");
  value = value.replace(/[.,;:]+$/g, "");
  if (!value) return null;

  try {
    const parsed = new URL(`https://${value}`);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const host = parsed.hostname.replace(/\.$/, "").toLowerCase();
    if (!host) return null;
    if (host === "localhost") {
      parsed.protocol = "https:";
      return parsed.href;
    }

    const labels = host.split(".");
    if (labels.length < 2) return null;
    if (labels.some((label) => !label || label.length > 63)) return null;
    const tld = labels[labels.length - 1];
    if (!/^[a-z]{2,24}$/i.test(tld) && !/^xn--[a-z0-9-]{2,}$/i.test(tld)) return null;

    parsed.protocol = "https:";
    parsed.hostname = host;
    return parsed.href;
  } catch {
    return null;
  }
}
