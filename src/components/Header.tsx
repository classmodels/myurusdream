"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navLinks, serviceNavLinks } from "@/lib/content";

const serviceLinks = serviceNavLinks;

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[rgba(10,17,28,0.92)] backdrop-blur-xl">
      <div className="container-x flex items-center justify-between gap-3 py-2.5 md:py-3">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/2.png"
            alt={`${brand.name} — ${brand.tagline}`}
            width={2043}
            height={770}
            priority
            className="h-14 w-auto sm:h-[4.5rem]"
          />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/diensten"
                ? pathname === "/diensten" || pathname.startsWith("/diensten/")
                : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3.5 py-2 text-sm font-semibold transition ${
                  active ? "bg-white/10 text-white" : "text-ink-soft hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/portaal" className="btn-ghost !hidden !px-4 !py-2.5 text-sm sm:!inline-flex">
            Portaal
          </Link>
          <Link href="/offerte" className="btn-soft !hidden !px-4 !py-2.5 text-sm sm:!inline-flex">
            Offerte aanvragen
          </Link>
          <button
            type="button"
            aria-label="Menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line-strong lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="flex w-4 flex-col gap-1.5">
              <span className={`h-0.5 bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 bg-ink transition ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div className="hidden border-t border-line/70 bg-[rgba(8,14,24,0.65)] lg:block">
        <div className="container-x flex flex-wrap items-center gap-1 py-2">
          {serviceLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-white/10 text-teal" : "text-ink-soft hover:bg-white/5 hover:text-teal"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg-alt px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-ink"
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-3 px-3 text-[0.7rem] font-bold tracking-wide text-teal uppercase">
              Diensten
            </p>
            {serviceLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/voortgang"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-ink-soft"
            >
              Voortgang / preview
            </Link>
            <Link
              href="/portaal"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-ink-soft"
            >
              Klantportaal
            </Link>
            <Link
              href="/briefing"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-sm font-semibold text-ink-soft"
            >
              Briefing uploaden
            </Link>
            <Link href="/offerte" onClick={() => setOpen(false)} className="btn-soft mt-2 text-sm">
              Offerte aanvragen
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
