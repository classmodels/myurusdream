"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";

const links = [
  { href: "/#teller", label: "Teller" },
  { href: "/#verhaal", label: "Verhaal" },
  { href: "/#hoe", label: "Hoe het werkt" },
  { href: "/volg-alles", label: "Volg alles" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border border-yellow text-yellow font-display text-lg">
            D2
          </span>
          <span className="font-display text-xl tracking-[0.18em]">{SITE_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm uppercase tracking-[0.14em] text-white/70 hover:text-yellow"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/meedoen" className="btn-yellow text-sm px-4 py-2">
            Doe mee voor €2
          </Link>
        </nav>
        <button
          className="md:hidden border border-yellow/50 px-3 py-1 text-xs uppercase tracking-widest"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-black/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="uppercase tracking-widest text-sm">
                {l.label}
              </Link>
            ))}
            <Link href="/meedoen" className="btn-yellow text-sm" onClick={() => setOpen(false)}>
              Doe mee voor €2
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
