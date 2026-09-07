import { PushSetup } from "@/components/PushSetup";

export function MeldingenBlock() {
  return (
    <section id="meldingen" className="scroll-mt-28">
      <p className="font-display text-sm tracking-[0.22em] text-yellow">Gsm</p>
      <h2 className="mt-2 font-display text-3xl">Meldingen</h2>
      <p className="mt-3 max-w-2xl text-white/75">
        Via de app ontvangt u een pushbericht bij aanpassingen en updates. Zet myurusdream.be
        één keer op het beginscherm en zet daarna meldingen aan.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-yellow">iPhone</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/80">
            <li>Open myurusdream.be in Safari (niet in Chrome of Facebook).</li>
            <li>Tik onderaan op Delen — het vierkant met de pijl omhoog.</li>
            <li>Tik op Zet op beginscherm en bevestig Toevoegen.</li>
            <li>Open daarna de site via dat icoon, niet via Safari.</li>
          </ol>
        </div>
        <div>
          <p className="font-display text-sm tracking-[0.22em] text-yellow">Android</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-white/80">
            <li>Open myurusdream.be in Chrome.</li>
            <li>Tik rechtsboven op de drie puntjes.</li>
            <li>Tik op App installeren of Toevoegen aan startscherm.</li>
            <li>Open daarna de app via het icoon.</li>
          </ol>
        </div>
      </div>

      <p className="mt-8 text-white/75">
        Tik hieronder op <strong>Zet meldingen aan</strong>. Op iPhone vraagt Apple daarna nog eens
        of u berichten toestaat.
      </p>
      <div className="mt-5">
        <PushSetup />
      </div>
    </section>
  );
}
