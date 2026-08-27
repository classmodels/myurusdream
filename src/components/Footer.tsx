import Link from "next/link";
import { LAMBORGHINI_DISCLAIMER, NOT_CHARITY_LINES, SITE_NAME } from "@/lib/constants";

const legal = [
  ["/voorwaarden", "Voorwaarden"],
  ["/campagnevoorwaarden", "Campagnevoorwaarden"],
  ["/privacy", "Privacy"],
  ["/cookies", "Cookies"],
  ["/terugbetaling", "Terugbetaling"],
  ["/disclaimer", "Disclaimer"],
  ["/contact", "Contact"],
  ["/winactie-voorwaarden", "Winactie"],
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <p className="font-display text-3xl text-yellow md:text-5xl">
          {NOT_CHARITY_LINES[0]} {NOT_CHARITY_LINES[1]}
        </p>
        <p className="mt-3 font-display text-2xl text-white/80 md:text-4xl">
          {NOT_CHARITY_LINES[2]} {NOT_CHARITY_LINES[3]}
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-xl tracking-[0.2em]">{SITE_NAME}</p>
            <p className="mt-3 text-sm text-muted">
              Vrijwillige eenmalige bijdrage van €2. Geen abonnement. Geen winstbelofte.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm uppercase tracking-widest text-white/70">
            {legal.map(([href, label]) => (
              <Link key={href} href={href} className="hover:text-yellow">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted">{LAMBORGHINI_DISCLAIMER}</p>
        </div>
        <p className="mt-10 text-xs text-white/40">
          © {new Date().getFullYear()} {SITE_NAME} · droomop2.be · onafhankelijke persoonlijke campagne
        </p>
      </div>
    </footer>
  );
}
