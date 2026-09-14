"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`border-b border-steel transition-colors duration-200 ${
          scrolled ? "bg-hangar" : "bg-hangar/90 backdrop-blur-md"
        }`}
      >
        <div className="relative z-10 flex w-full items-center justify-between gap-3 py-2 pr-4 pl-[50px] md:pr-6">
          <Link
            href="/"
            className="relative z-50 -mb-7 shrink-0 self-start md:-mb-9 lg:-mb-10"
            aria-label="Zetor Museum — home"
          >
            <Image
              src="/logo-v5.png"
              alt="Zetor Museum"
              width={360}
              height={120}
              className="h-[4.25rem] w-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] md:h-[5.25rem] lg:h-[6rem]"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-sm px-2 py-1 text-[0.68rem] font-semibold tracking-wide uppercase transition ${
                    active ? "bg-zetor text-white" : "text-ink-dim hover:bg-steel/60 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={site.phoneHref}
              className="hidden rounded-sm bg-zetor px-3 py-2 text-xs font-semibold text-white sm:inline-flex"
            >
              Bel afspraak
            </a>
            <button
              type="button"
              className="rounded-sm border border-steel px-3 py-2 text-xs font-semibold text-ink lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              Menu
            </button>
          </div>
        </div>

        {/* Bij scroll: dichte strook zodat content onder het logo verdwijnt */}
        <div
          className={`bg-hangar transition-[height] duration-200 ${
            scrolled ? "h-8 md:h-10 lg:h-11" : "h-0"
          }`}
          aria-hidden
        />
      </div>

      {open && (
        <div className="border-b border-steel bg-hangar-2 px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-sm px-3 py-2.5 text-sm font-semibold text-ink hover:bg-steel/50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
