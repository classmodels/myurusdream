export const REF_COOKIE = "myurusdream_ref";
const REF_MAX_AGE = 60 * 60 * 24 * 30;

export function normalizeReferralCode(raw: string | undefined | null): string {
  return (raw || "").trim().slice(0, 32);
}

export function referralFromPathname(pathname: string): string {
  const match = pathname.match(/^\/meedoen\/([^/]+)\/?$/);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).trim().slice(0, 32);
  } catch {
    return "";
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

export function refCookieSet(code: string) {
  return `${REF_COOKIE}=${encodeURIComponent(code)}; Path=/; Max-Age=${REF_MAX_AGE}; SameSite=Lax`;
}
