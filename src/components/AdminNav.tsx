"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overzicht" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/pixels", label: "Pixelwall" },
  { href: "/admin/bezoekers", label: "Bezoekers" },
  { href: "/admin/mailen", label: "Mailen" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/campagne", label: "Campagne" },
  { href: "/admin/betalingen", label: "Betalingen" },
  { href: "/admin/instellingen", label: "Instellingen" },
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const active = item.href === "/admin" ? path === "/admin" : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] ${
              active ? "border-yellow bg-yellow text-black" : "border-yellow/50 text-yellow hover:bg-yellow hover:text-black"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
