import Link from "next/link";
import { LIVE_DRAW } from "@/lib/constants";
import { sponsorSignupHref } from "@/lib/sponsors";

export function LiveDrawBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "" : "border border-yellow/40 bg-black/50 p-6 md:p-8"}>
      <p className="font-display text-[0.8rem] tracking-[0.28em] text-yellow">Campagnemoment</p>
      <h2 className={`mt-3 font-display ${compact ? "text-3xl" : "text-4xl md:text-5xl"}`}>
        <span className="text-yellow">Als het doel gehaald wordt,</span>
      </h2>
      <p className="mt-0 max-w-3xl font-display text-base leading-snug text-white md:text-lg">
        vieren we dat moment <span className="text-yellow">live</span> — met merken zichtbaar
        voor iedereen die meekeek.
        <span className="mt-3 block">
          Geen trekking van winnaars.
          <br />
          Wel merkzichtbaarheid voor de campagne.
        </span>
      </p>
      <p className="mt-2 font-display text-sm text-white/85 md:text-base">
        Alles gebeurt <span className="text-yellow">open</span>,{" "}
        <span className="text-yellow">transparant</span> en{" "}
        <span className="text-yellow">live</span> te volgen.
      </p>
      <div className="mt-12 max-w-3xl">
        <p className="mb-2 font-display text-[0.8rem] tracking-[0.28em] text-yellow">
          Campagnemoment
        </p>
        <div className="border border-[#e6d4a0] px-3 py-2.5">
          <p className="text-white/80">
            Gepland op {LIVE_DRAW.dateLabel}, op een spectaculaire, nog bekend te maken locatie in
            België
            <br />
            live gestreamd voor iedereen die meedeed.
          </p>
          <p className="mt-5 text-[0.7rem] leading-relaxed text-white/55">
            Er is geen garantie dat dit moment doorgaat. Het vindt alleen plaats als het doel van
            €400.000 gehaald is. Wordt dat doel niet gehaald, dan blijft uw steun staan: als
            sponsor hebt u de reclame tijdens de actie gehad, zonder terugbetaling. Ook de
            €2-bijdragen worden niet teruggestort. Afhankelijk van het opgehaalde bedrag gaat dat
            geld dan naar een ander voertuig. Bijdragen zijn vrijwillig — zonder prijs of kans op
            winst.
          </p>
        </div>
      </div>
      {!compact ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={sponsorSignupHref("gold")} className="btn-yellow">
            Word sponsor
          </Link>
          <Link href="/pixels" className="btn-ghost">
            Pixelwall
          </Link>
        </div>
      ) : null}
    </div>
  );
}
