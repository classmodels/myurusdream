import Link from "next/link";
import { LAMBORGHINI_DISCLAIMER, SITE_NAME } from "@/lib/constants";

const explore = [
  ["/", "Home"],
  ["/meedoen", "Meedoen"],
  ["/sponsors", "Sponsors"],
  ["/pixels", "Pixelwall"],
  ["/#how-it-works", "Hoe het werkt"],
  ["/volg-alles", "Volg alles"],
  ["/discussie", "Discussie"],
  ["/faq", "FAQ"],
  ["/dashboard", "Dashboard"],
];

const legal = [
  ["/voorwaarden#algemene-voorwaarden", "Voorwaarden"],
  ["/voorwaarden#campagnevoorwaarden", "Campagnevoorwaarden"],
  ["/voorwaarden#privacybeleid", "Privacy"],
  ["/cookies", "Cookies"],
  ["/terugbetaling", "Terugbetaling"],
  ["/disclaimer", "Disclaimer"],
  ["/contact", "Contact"],
  ["/winactie-voorwaarden", "Winactie"],
];

export function Footer() {
  return (
    <footer className="border-t border-white/15 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 pb-6 pt-10 md:flex-row md:items-stretch">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-display text-base tracking-[0.12em]">{SITE_NAME}</p>
              <p className="mt-1.5 text-xs text-muted">
                Vrijwillige bijdrage van €2, zo vaak u wilt. Geen abonnement. Geen winstbelofte.
              </p>
              <Link href="/meedoen" className="btn-yellow mt-3 text-xs">
                Ik doe mee voor €2
              </Link>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-yellow">Ontdek</p>
              <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] uppercase tracking-wider text-white/70">
                {explore.map(([href, label]) => (
                  <Link key={href} href={href} className="hover:text-yellow">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/40">
            © {new Date().getFullYear()} {SITE_NAME} · onafhankelijke persoonlijke campagne
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col justify-between gap-3 border border-yellow/30 bg-surface p-3 md:w-[22rem]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-yellow">Juridisch</p>
            <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] uppercase tracking-wider text-white/70">
              {legal.map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-yellow">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-snug text-white/75">
            {LAMBORGHINI_DISCLAIMER} Foto’s van een gele Urus zijn sfeerbeelden van de droom, geen
            partnership.
          </p>
        </div>
      </div>
    </footer>
  );
}
