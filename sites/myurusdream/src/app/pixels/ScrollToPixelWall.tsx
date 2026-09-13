"use client";

import { useEffect } from "react";

export function ScrollToPixelWall() {
  useEffect(() => {
    document.getElementById("pixelmuur")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return null;
}
