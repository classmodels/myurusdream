"use client";

import { useEffect } from "react";
import { clearReferralClient } from "@/lib/referral";

/** Clears leftover invite cookie/storage after logout (?resetRef=1). */
export function ResetReferralClient() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("resetRef") !== "1") return;
    clearReferralClient();
    params.delete("resetRef");
    const next = params.toString();
    window.history.replaceState({}, "", next ? `/inloggen?${next}` : "/inloggen");
  }, []);
  return null;
}
