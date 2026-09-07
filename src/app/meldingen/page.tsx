import { PushSetup } from "@/components/PushSetup";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meldingen",
  description: "Installeer de app op iPhone of Android en ontvang pushberichten bij belangrijke updates.",
};

export default function MeldingenPage() {
  return (
    <div className="mx-auto max-w-xl px-5 pb-24 pt-28">
      <p className="font-display text-sm tracking-[0.3em] text-yellow">Gsm</p>
      <h1 className="mt-3 font-display text-4xl">Meldingen</h1>
      <p className="mt-4 text-white/75">
        Via de app ontvangt u een pushbericht bij elke aanpassing en bij relevante zaken: berichten,
        teller, campagne-updates. Zo blijft u dagelijks op de hoogte van wat belangrijk is, ook als
        u de site niet open hebt.
      </p>

      <section className="mt-10">
        <p className="font-display text-sm tracking-[0.22em] text-yellow">App installeren</p>
        <h2 className="mt-2 font-display text-2xl">Eerst het icoon op uw startscherm</h2>
        <p className="mt-3 text-white/75">
          Meldingen werken via de app op uw gsm. Zet myurusdream.be één keer op het beginscherm.
          Daarna opent u altijd dat icoon.
        </p>
      </section>

      <section className="mt-8">
        <p className="font-display text-sm tracking-[0.22em] text-yellow">iPhone</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/80">
          <li>Open myurusdream.be in Safari (niet in Chrome of Facebook).</li>
          <li>Tik onderaan op Delen — het vierkant met de pijl omhoog.</li>
          <li>Tik op Zet op beginscherm en bevestig Toevoegen.</li>
          <li>Sluit Safari en open de site via het nieuwe icoon op uw beginscherm.</li>
        </ol>
      </section>

      <section className="mt-8">
        <p className="font-display text-sm tracking-[0.22em] text-yellow">Android</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/80">
          <li>Open myurusdream.be in Chrome.</li>
          <li>Tik rechtsboven op de drie puntjes.</li>
          <li>Tik op App installeren of Toevoegen aan startscherm.</li>
          <li>Open daarna de app via het icoon, niet via een gewone tab.</li>
        </ol>
      </section>

      <section className="mt-8">
        <p className="font-display text-sm tracking-[0.22em] text-yellow">Meldingen aanzetten</p>
        <p className="mt-3 text-white/75">
          Het icoon alleen is niet genoeg. Tik hieronder op <strong>Zet meldingen aan</strong>. Op
          iPhone vraagt Apple daarna nog eens of u berichten toestaat. Zonder die twee stappen komen
          er geen pushberichten.
        </p>
      </section>

      <div className="mt-8">
        <PushSetup />
      </div>
    </div>
  );
}
