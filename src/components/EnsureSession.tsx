"use client";

import { useEffect } from "react";

export function EnsureSession({ paymentId }: { paymentId: string }) {
  useEffect(() => {
    fetch("/api/auth/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    }).catch(() => {
      /* cookie claim is best-effort; login remains available */
    });
  }, [paymentId]);
  return null;
}
