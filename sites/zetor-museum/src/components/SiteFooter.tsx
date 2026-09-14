import Image from "next/image";
import { site } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-steel bg-hangar-2 md:mt-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 md:py-7">
        <div className="flex items-center gap-4">
          <Image
            src="/logo-v5.png"
            alt="Zetor Museum"
            width={280}
            height={90}
            className="h-12 w-auto md:h-14"
          />
          <div>
            <p className="text-sm text-ink-dim">{site.tagline}</p>
            <p className="mt-0.5 text-xs text-ink-mute">Collectie Herman Michiels · Houtvenne</p>
          </div>
        </div>
        <div className="text-sm md:text-right">
          <p className="text-ink-dim">{site.museumAddress}</p>
          <p className="mt-0.5">
            <a href={site.phoneHref} className="text-zetor hover:underline">
              {site.phone}
            </a>
            <span className="text-ink-mute"> · </span>
            <a href={site.emailHref} className="text-ink-dim hover:text-ink">
              {site.email}
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-steel/70 py-2.5 text-center text-[0.65rem] text-ink-mute">
        Demo-site · inhoud &amp; foto’s geïnspireerd op michielsh.be/zetormuseum · lokaal poort 3001
      </div>
    </footer>
  );
}
