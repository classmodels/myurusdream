"use client";

import { useEffect } from "react";

export function TrackVisit() {
  useEffect(() => {
    fetch("/api/visit", { method: "POST" }).catch(() => undefined);
  }, []);
  return null;
}
