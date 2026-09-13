import Image from "next/image";
import Link from "next/link";
import { brand, navLinks } from "@/lib/content";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-[#070d16]">
      <div className="container-x grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10 md:py-14">
        <div>
          <div className="mb-4">
            <Image
              src="/2.png"
              alt={brand.name}
              width={2043}
              height={770}
              className="h-16 w-auto"
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            {brand.tagline} Optioneel inclusief logo, teksten, fotografie en video. Offerte binnen
            24 uur. Eerste ontwerp binnen 48 uur.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.14em] text-teal uppercase">Navigatie</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
            <li><Link href="/offerte" className="hover:text-white">Offerte</Link></li>
            <li><Link href="/briefing" className="hover:text-white">Briefing</Link></li>
            <li><Link href="/portaal" className="hover:text-white">Klantportaal</Link></li>
            <li><Link href="/voortgang" className="hover:text-white">Voortgang / preview</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.14em] text-blue uppercase">Contact</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>{brand.email}</li>
            <li>{brand.phone}</li>
            <li>België & Nederland</li>
            <li>Support 24/7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Alle rechten voorbehouden.</p>
          <p>Websites met strategische focus en meetbaar resultaat.</p>
        </div>
      </div>
    </footer>
  );
}
