"use client";

import { useEffect } from "react";
import { REF_COOKIE, referralFromPathname } from "@/lib/referral";

export function CaptureReferral() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get("ref")?.trim() || referralFromPathname(window.location.pathname)).slice(0, 32);
    if (!ref) return;
    document.cookie = `${REF_COOKIE}=${encodeURIComponent(ref)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }, []);
  return null;
}
