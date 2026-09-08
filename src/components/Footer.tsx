import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function Footer() {
  const dict = await getDictionary();
  const legal = [
    ["/voorwaarden#algemene-voorwaarden", dict.legalLinks.terms],
    ["/voorwaarden#campagnevoorwaarden", dict.legalLinks.campaign],
    ["/voorwaarden#privacybeleid", dict.legalLinks.privacy],
    ["/cookies", dict.legalLinks.cookies],
    ["/terugbetaling", dict.legalLinks.refund],
    ["/disclaimer", dict.legalLinks.disclaimer],
    ["/contact", dict.legalLinks.contact],
  ] as const;

  return (
    <footer className="border-t border-yellow/25 bg-bg">
      <div className="mx-auto max-w-7xl px-5 pt-10">
        <div className="grid items-center gap-8 md:grid-cols-[auto_auto_auto] md:justify-between">
          <div className="justify-self-center text-center md:justify-self-start md:text-left">
            <p className="text-xs text-muted xl:whitespace-nowrap">{dict.footer.voluntary}</p>
            <p className="mt-2 font-script text-2xl leading-snug tracking-[0.08em]">
              {dict.footer.everyGift}
            </p>
            <Link href="/meedoen" className="btn-yellow mt-4 text-xs">
              {dict.common.meedoen}
            </Link>
          </div>
          <div className="justify-self-center border-x border-yellow/30 px-8 text-center">
            <p className="font-display text-[0.65rem] tracking-[0.18em] text-white/85">
              {dict.footer.supportWith}
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-yellow">€2</p>
            <p className="mt-1 font-display text-[0.6rem] tracking-[0.16em] text-white/70">
              {dict.footer.smallGift}
            </p>
          </div>
          <div className="flex w-full flex-col justify-between gap-3 border border-yellow/30 bg-surface p-3 md:w-[22rem] md:justify-self-end">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-yellow">{dict.footer.legal}</p>
              <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] uppercase tracking-wider text-white/70">
                {legal.map(([href, label]) => (
                  <Link key={href} href={href} className="hover:text-yellow">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <p className="text-[11px] leading-snug text-white/75">
              {dict.lamborghini} {dict.footer.photos}
            </p>
          </div>
        </div>
        <div className="gold-hairline mt-8" />
        <p className="py-4 text-center font-display text-xs tracking-[0.22em] text-yellow">
          <Link href="/" className="hover:text-gold-bright">
            WWW.MYURUSDREAM.BE
          </Link>
        </p>
        <div className="gold-hairline" />
      </div>
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-4">
        <p className="text-[10px] text-white/40">
          © {new Date().getFullYear()} {SITE_NAME} · {dict.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
