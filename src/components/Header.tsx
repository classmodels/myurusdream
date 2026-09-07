"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { NotificationBell } from "@/components/NotificationBell";

export function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = [
    { href: "/#teller", label: "Teller" },
    { href: "/#verhaal", label: "Verhaal" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/pixels", label: "Pixelwall" },
    { href: "/volg-alles", label: "Volg alles" },
    { href: "/discussie", label: "Discussie" },
    { href: "/faq", label: "FAQ" },
    { href: loggedIn ? "/dashboard" : "/inloggen", label: loggedIn ? "Dashboard" : "Inloggen" },
    { href: "/admin", label: "Admin" },
    { href: "/meldingen", label: "Meldingen" },
    { href: "/meldingen", label: "Meldingen" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "whitespace-nowrap text-xs uppercase tracking-[0.14em] text-white/75 hover:text-yellow";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-white/10" : "bg-black/25 backdrop-blur-[2px]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-1">
          <span className="relative h-9 w-8 shrink-0 overflow-hidden">
            <img
              src="/3.png?v=20260828e"
              alt=""
              className="absolute left-1/2 top-1/2 h-[102%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          </span>
          <span className="truncate font-display text-lg tracking-[0.12em] text-yellow sm:text-xl sm:tracking-[0.14em]">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="hidden items-center gap-4 xl:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <NotificationBell loggedIn={loggedIn} />
          <Link href="/meedoen" className="header-cta">
            {loggedIn ? "Nog eens €2" : "Ik doe mee voor €2"}
          </Link>
        </nav>
        <div className="xl:hidden">
          <button
            type="button"
            className={linkClass}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? "Sluiten" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-black px-5 py-5 xl:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="uppercase tracking-widest text-sm"
              >
                {l.label}
              </Link>
            ))}
            <NotificationBell loggedIn={loggedIn} />
            <Link href="/meedoen" className="header-cta w-fit" onClick={() => setOpen(false)}>
              {loggedIn ? "Nog eens €2" : "Ik doe mee voor €2"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
