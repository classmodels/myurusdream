import { PushSetup } from "@/components/PushSetup";

export const dynamic = "force-dynamic";

export default function MeldingenPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-28">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Gsm</p>
      <h1 className="mt-3 font-display text-4xl">Meldingen</h1>
      <p className="mt-4 text-white/75">
        Het icoon op je startscherm is niet genoeg. Tik hieronder op <strong>Zet meldingen aan</strong>.
        Apple vraagt daarna nog eens of je berichten toestaat. Zonder die twee stappen komen er geen
        meldingen.
      </p>
      <div className="mt-8">
        <PushSetup />
      </div>
    </div>
  );
}
