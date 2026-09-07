export const REF_COOKIE = "myurusdream_ref";
export const REF_STORAGE = "myurusdream_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 30;

export function normalizeReferralCode(raw: string | undefined | null): string {
  return (raw || "").trim().slice(0, 32);
}

export function referralFromPathname(pathname: string): string {
  const match = pathname.match(/^\/(?:meedoen|r)\/([^/]+)\/?$/);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).trim().slice(0, 32);
  } catch {
    return "";
  }
}

export function parseShareCode(urlOrPath: string): string {
  const raw = (urlOrPath || "").trim();
  if (!raw) return "";
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(raw, "https://myurusdream.be");
    const wrapped = url.searchParams.get("u");
    if (url.hostname.includes("facebook.") && wrapped) {
      return parseShareCode(wrapped);
    }
    const fromQuery = normalizeReferralCode(url.searchParams.get("ref"));
    if (fromQuery) return fromQuery;
    return referralFromPathname(url.pathname);
  } catch {
    return referralFromPathname(raw.split("?")[0] || "");
  }
}

export function parseRefCookie(cookieHeader: string | null): string {
  if (!cookieHeader) return "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${REF_COOKIE}=([^;]+)`));
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).trim().slice(0, 32);
  } catch {
    return "";
  }
}

export function refCookieSet(code: string, secure = false) {
  const extra = secure ? "; Secure" : "";
  return `${REF_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${REF_MAX_AGE}; SameSite=Lax${extra}`;
}

export function persistReferralClient(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized || typeof document === "undefined") return;
  const secure = window.location.protocol === "https:";
  document.cookie = refCookieSet(normalized, secure);
  try {
    localStorage.setItem(REF_STORAGE, normalized);
  } catch {
    /* private mode */
  }
}

export function readStoredReferralClient(): string {
  if (typeof document === "undefined") return "";
  const fromCookie = parseRefCookie(document.cookie);
  if (fromCookie) return fromCookie;
  try {
    return normalizeReferralCode(localStorage.getItem(REF_STORAGE));
  } catch {
    return "";
  }
}
