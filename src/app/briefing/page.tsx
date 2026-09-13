import type { Metadata } from "next";
import { BriefingForm } from "@/components/BriefingForm";

export const metadata: Metadata = {
  title: "Briefingportaal",
  description: "Upload teksten, logo's, foto's en referenties voor uw websiteproject.",
};

export default function BriefingPage() {
  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-20">
        <div className="mb-8 max-w-2xl md:mb-10">
          <p className="eyebrow">Briefingportaal</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[1.85rem] font-extrabold text-ink md:text-5xl">
            Lever projectmateriaal centraal aan.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            Teksten, logo&apos;s, foto&apos;s, video&apos;s en referentievoorbeelden — zo starten we sneller
            en accurater.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.7fr]">
          <BriefingForm />
          <aside className="space-y-4">
            <div className="card p-6">
              <h2 className="font-bold text-ink-on-light">Aanbevolen documentatie</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-on-light">
                <li>• Bestaand logo of huisstijlrichtlijnen</li>
                <li>• Teksten of kernboodschappen per pagina</li>
                <li>• Beeldmateriaal van zaak, team of producten</li>
                <li>• Referentiesites die u relevant vindt</li>
                <li>• Eventuele video- of sfeerbeelden</li>
              </ul>
            </div>
            <div className="rounded-2xl border-l-4 border-[#0056c7] bg-[#007aff] p-6 text-white shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
              <h2 className="font-bold text-white">Nog geen content?</h2>
              <p className="mt-2 text-sm text-white/90">
                Geen probleem. Wij kunnen logo, teksten, fotografie en video voor u verzorgen.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
