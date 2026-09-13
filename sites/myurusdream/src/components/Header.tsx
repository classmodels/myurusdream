"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { persistReferralClient, readStoredReferralClient, referralFromPathname } from "@/lib/referral";
import { useDict } from "@/lib/i18n/client";

export function Header({ loggedIn = false }: { loggedIn?: boolean }) {
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [meedoenHref, setMeedoenHref] = useState("/meedoen");
  const links = [
    { href: "/#teller", label: dict.nav.teller },
    { href: "/#verhaal", label: dict.nav.verhaal },
    { href: "/sponsors", label: dict.nav.sponsors },
    { href: "/pixels", label: dict.nav.pixelwall },
    { href: "/volg-alles", label: dict.nav.volgAlles },
    { href: "/discussie", label: dict.nav.discussie },
    { href: "/faq", label: dict.nav.faq },
    { href: "/dashboard", label: dict.nav.dashboard },
  ];
  const adminLink = { href: "/admin", label: dict.nav.admin };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const fromPath = referralFromPathname(window.location.pathname);
    const fromQuery = new URLSearchParams(window.location.search).get("ref");
    const stored = fromPath || fromQuery || readStoredReferralClient();
    if (stored) {
      persistReferralClient(stored);
      setMeedoenHref(`/meedoen/${encodeURIComponent(stored)}`);
    }
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-white/75 hover:text-yellow";

  function go(href: string, e: MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    if (!href.includes("#")) return;
    const hash = href.slice(href.indexOf("#") + 1);
    const path = href.slice(0, href.indexOf("#")) || "/";
    const here = window.location.pathname.replace(/\/$/, "") || "/";
    const target = path.replace(/\/$/, "") || "/";
    if (here !== target) return;
    e.preventDefault();
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `${path}#${hash}`);
    }, 50);
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors ${
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-white/10" : "bg-black/25 backdrop-blur-[2px]"
      }`}
    >
      <div className="relative flex h-[66px] items-center justify-between gap-3 px-4 sm:px-6 xl:px-[30px]">
        <Link href="/" className="relative z-20 flex min-w-0 shrink flex-col items-start justify-center">
          <span className="whitespace-nowrap font-display text-base font-bold tracking-[0.1em] text-white sm:text-xl sm:tracking-[0.14em]">
            MY <span className="text-yellow">URUS</span> DREAM
          </span>
          <span className="mt-[2px] flex items-center gap-2">
            <span className="h-px w-3 bg-yellow/70" aria-hidden="true" />
            <span className="whitespace-nowrap font-display text-[0.5rem] tracking-[0.22em] text-white/80">
              {dict.brand.drive}
            </span>
            <span className="h-px w-3 bg-yellow/70" aria-hidden="true" />
          </span>
        </Link>

        <nav className="pointer-events-none absolute inset-y-0 left-[11.5rem] right-[20rem] z-10 hidden items-center xl:flex">
          <div className="pointer-events-auto mx-auto flex max-w-full items-center justify-center overflow-x-auto">
            {links.map((l, i) => (
              <span key={l.href} className="flex items-center">
                {i > 0 ? <span className="mx-1.5 h-3 w-px shrink-0 bg-white/30" aria-hidden="true" /> : null}
                <Link href={l.href} className={linkClass} onClick={(e) => go(l.href, e)}>
                  {l.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center">
              <span className="mx-1.5 h-3 w-px shrink-0 bg-white/30" aria-hidden="true" />
              <NotificationBell loggedIn={loggedIn} />
            </span>
          </div>
        </nav>

        <div className="relative z-20 flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href={meedoenHref} className="header-cta hidden xl:inline-flex">
            {loggedIn ? dict.nav.ctaAgain : dict.nav.cta}
          </Link>
          <Link
            href={adminLink.href}
            className={`${linkClass} hidden xl:inline`}
            onClick={(e) => go(adminLink.href, e)}
          >
            {adminLink.label}
          </Link>
          <button
            type="button"
            className={`${linkClass} xl:hidden`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={dict.nav.menu}
          >
            {open ? dict.nav.close : dict.nav.menu}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {open ? (
        <div className="relative z-30 max-h-[min(70vh,28rem)] overflow-y-auto border-t border-white/10 bg-black px-4 py-5 sm:px-6 xl:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => go(l.href, e)}
                className="uppercase tracking-widest text-sm"
              >
                {l.label}
              </Link>
            ))}
            <NotificationBell loggedIn={loggedIn} />
            <Link
              href={meedoenHref}
              className="header-cta inline-flex w-fit"
              onClick={() => setOpen(false)}
            >
              {loggedIn ? dict.nav.ctaAgain : dict.nav.cta}
            </Link>
            <Link
              href={adminLink.href}
              onClick={(e) => go(adminLink.href, e)}
              className="uppercase tracking-widest text-sm"
            >
              {adminLink.label}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
