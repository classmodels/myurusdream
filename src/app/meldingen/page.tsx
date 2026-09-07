import { PushSetup } from "@/components/PushSetup";

export const dynamic = "force-dynamic";

export default function MeldingenPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-28">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Gsm</p>
      <h1 className="mt-3 font-display text-4xl">Meldingen</h1>
      <p className="mt-4 text-white/75">
        Zet dit aan om een voorvertoning en een cijfer op het icoon te krijgen als iemand stort of u een
        bericht stuurt.
      </p>
      <div className="mt-8">
        <PushSetup />
      </div>
    </div>
  );
}
