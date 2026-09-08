"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/lib/i18n/client";

export function CookieBanner() {
  const dict = useDict();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(localStorage.getItem("myurusdream_cookies") !== "essential");
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-yellow/30 bg-black/95 p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-white/80">
          {dict.cookie.text}{" "}
          <a href="/cookies" className="text-yellow underline">
            {dict.cookie.policy}
          </a>
        </p>
        <button
          className="btn-yellow text-sm px-4 py-2"
          onClick={() => {
            localStorage.setItem("myurusdream_cookies", "essential");
            setShow(false);
          }}
        >
          {dict.cookie.accept}
        </button>
      </div>
    </div>
  );
}
