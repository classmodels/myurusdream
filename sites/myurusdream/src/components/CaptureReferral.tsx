"use client";

import { useEffect } from "react";
import { persistReferralClient, referralFromPathname } from "@/lib/referral";

export function CaptureReferral() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get("ref")?.trim() || referralFromPathname(window.location.pathname)).slice(0, 32);
    if (!ref) return;
    persistReferralClient(ref);
  }, []);
  return null;
}
