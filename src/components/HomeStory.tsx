"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

function GoldTitle({ children, as: Tag = "h3" }: { children: ReactNode; as?: "h2" | "h3" }) {
  return (
    <Tag className="font-display text-[1.05rem] leading-snug tracking-[0.06em] text-yellow sm:text-xl md:text-2xl">
      {children}
    </Tag>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-[0.95rem] leading-relaxed text-white/80 md:text-base">{children}</p>;
}

function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-yellow">{children}</strong>;
}

function GoldLine({ children }: { children: ReactNode }) {
  return (
    <Em>
      <span className="mt-1.5 block">{children}</span>
    </Em>
  );
}

function Quote({ children, block = false }: { children: ReactNode; block?: boolean }) {
  return (
    <em className={block ? "mt-1.5 block text-white/70" : "ml-3 text-white/70"}>
      {children}
    </em>
  );
}

function Beat({ children }: { children: ReactNode }) {
  return <div className="story-beat">{children}</div>;
}

function MoreBtn({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="ml-4 inline align-baseline font-display text-[0.75rem] uppercase tracking-[0.14em] text-white/40 transition hover:text-white/70"
      aria-expanded={expanded}
    >
      {expanded ? "Minder lezen" : "Meer lezen"}
    </button>
  );
}

function StoryPhoto() {
  return (
    <img
      src="/images/urus-detail.png?v=20260908c"
      alt="Detail van de Urus"
      className="story-photo"
    />
  );
}

function StoryPreview({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="story-prose">
      <StoryPhoto />
      <P>
        Ik ga u geen verhaal vertellen over een goed doel en ik ga u ook niet proberen te overtuigen
        met ziekte, drama of een verzonnen reden waarom ik uw geld zou verdienen.{" "}
        <Em>
          <span className="mt-2 block">
            Mijn reden is veel eenvoudiger: ik droom al heel mijn leven van een uitzonderlijke wagen
            en voor mij is dat de Lamborghini Urus.
          </span>
        </Em>
      </P>

      <P>
        Mijn leven is niet altijd gelopen zoals ik het ooit voor ogen had. Ik ben getrouwd geweest,
        kreeg twee kinderen en dacht, zoals zoveel mensen, dat ik ongeveer wist hoe mijn toekomst
        eruit zou zien. Het leven besliste anders. Er zijn mooie maar ook moeilijke jaren geweest,
        jaren waarin dromen naar de achtergrond verdwenen en andere dingen belangrijker waren:
        werken, doorgaan, opnieuw beginnen en rijden met de auto&apos;s die op dat moment haalbaar
        waren. Maar sommige dromen verdwijnen niet, en die Lamborghini Urus is er voor mij zo één.
      </P>

      <P>
        Ik weet natuurlijk perfect wat zo&apos;n wagen kost. Zelf ongeveer €400.000 op tafel leggen
        is voor mij simpelweg niet realistisch. Dus kon ik accepteren dat het altijd een droom zou
        blijven,{" "}
        <Em>
          <span className="mt-2 block">of één keer in mijn leven iets compleet anders proberen.</span>
        </Em>
      </P>

      <P>
        Niet één persoon €400.000 vragen, maar 200.000 mensen €2. Dat is het hele idee achter{" "}
        <Em>My Urus Dream</Em>. Geen grote sponsor, geen miljonair die alles betaalt en geen zielig
        verhaal, maar heel veel mensen die ieder een piepklein stukje van een bijna onmogelijke
        droom dragen. <Em>200.000 mensen × €2 = €400.000.</Em> Voor één persoon verandert €2
        waarschijnlijk niets, maar 200.000 keer €2 kan iets ongelooflijks mogelijk maken.
        {!expanded ? <MoreBtn expanded={false} onToggle={onToggle} /> : null}
      </P>
    </div>
  );
}

function StoryRest({ onCollapse }: { onCollapse: () => void }) {
  return (
    <div className="story-prose story-rest mt-6">
      <GoldTitle>NIET ÉÉN PERSOON €400.000 VRAGEN, MAAR 200.000 MENSEN €2.</GoldTitle>

      <Beat>
        <P>
          Misschien denkt u:
          <Quote>“Waarom zou ik €2 geven zodat iemand anders een Lamborghini kan kopen?”</Quote>
          <span className="ml-3">Een terechte vraag.</span>
        </P>
        <P>
          Ik beweer niet dat ik een Lamborghini nodig heb, dat ik hem verdien of dat mijn droom
          belangrijker is dan die van iemand anders.
          <GoldLine>
            Ik probeer gewoon iets waarvan bijna iedereen zal zeggen: “Dat lukt nooit.”
          </GoldLine>
        </P>
        <P>
          Maar stel dat het wél lukt? Dat 200.000 gewone mensen, die elkaar niet eens kennen, samen
          iets realiseren wat voor één gewone persoon totaal onbereikbaar is? Dan gaat dit niet
          alleen meer over een auto, maar over wat er mogelijk wordt wanneer heel veel mensen
          allemaal één heel klein ding doen.
        </P>
      </Beat>

      <Beat>
        <P>
          En daar zit meteen de moeilijkheid. Misschien denkt u:
          <Quote>“Als genoeg andere mensen €2 storten, komt hij er wel.”</Quote>
          <GoldLine>
            Maar als iedereen denkt dat iemand anders het zal doen, gebeurt er niets.
          </GoldLine>
        </P>
        <P>
          Het werkt alleen als de persoon die dit nú leest denkt:
          <Quote>“Ach kom, voor €2 doe ik mee.”</Quote>
        </P>
      </Beat>

      <Beat>
        <P>
          Veel vraag ik eigenlijk niet: één minuut van uw tijd. Klik op{" "}
          <Em>‘Ik doe mee voor €2’</Em>, vul uw naam in en scan de QR-code; de betaling verloopt via
          het officiële betaalsysteem. Klaar.
        </P>
        <P>
          En wat is €2 vandaag nog? Een pintje, frisdrank of koffie kost vaak al meer. Laat één
          drankje staan en u hebt financieel misschien zelfs nog winst gemaakt, maar hier krijgt u
          er iets bij:
          <GoldLine>
            u wordt een klein stukje van dit verhaal en kunt, als deze compleet gekke droom
            werkelijkheid wordt, zeggen: “Ik heb meegedaan.”
          </GoldLine>
        </P>
      </Beat>

      <GoldTitle>EN MISSCHIEN RIJDT U ZELF WEL MET DE URUS</GoldTitle>

      <Beat>
        <P>
          Als de actie slaagt, wil ik de droom ook delen. Zoals u verder op deze website kunt lezen:
          <GoldLine>
            vier weekends met de Lamborghini Urus worden weggegeven. Twee weekends worden door het
            lot bepaald.
          </GoldLine>
        </P>
        <P>
          Daardoor maakt ook iemand die gewoon één keer €2 stort kans om zelf de sleutels in handen
          te krijgen.
        </P>
      </Beat>

      <Beat>
        <P>
          <GoldLine>
            De andere twee weekends laat ik niet alleen aan het geluk over: daar hebt u zelf invloed
            op.
          </GoldLine>
        </P>
        <P>
          U stort zelf maar één keer €2 en kunt daarna andere mensen uitnodigen om ook deel te
          nemen. Stort iemand via u, dan verdient u punten. En als die persoon het verhaal
          vervolgens verder verspreidt en er via hem of haar opnieuw mensen deelnemen,{" "}
          <Em>levert dat u eveneens punten op.</Em>
        </P>
        <P>
          Uw ene deelname kan dus het begin worden van een hele ketting.
          <GoldLine>
            De twee deelnemers die uiteindelijk de meeste punten verzamelen, winnen ieder een
            weekend met de Lamborghini Urus.
          </GoldLine>
        </P>
      </Beat>

      <GoldTitle>LAAT HET VERHAAL VIRAAL GAAN</GoldTitle>

      <Beat>
        <P>
          En dat is eigenlijk mijn tweede droom met dit project: niet alleen die Urus realiseren,
          maar ontdekken
          <GoldLine>hoe ver we dit verhaal samen kunnen krijgen.</GoldLine>
        </P>
        <P>
          Deel uw persoonlijke link met vrienden, familie en collega&apos;s via WhatsApp, Facebook,
          Instagram, TikTok of waar u maar wilt. Vertel gewoon:
          <Quote block>
            “Er is iemand die probeert een Lamborghini Urus te realiseren door 200.000 mensen elk €2
            te laten bijdragen.”
          </Quote>
        </P>
      </Beat>

      <Beat>
        <P>
          Misschien lachen mensen ermee en zeggen ze:
          <Quote>“Die is compleet gek.”</Quote>
        </P>
        <P>
          Prima. Maar misschien denken ze daarna ook:
          <GoldLine>“Weet je wat? Voor €2 wil ik wel eens zien of het hem lukt.”</GoldLine>
        </P>
        <P>
          En precies dát kan dit verhaal groot maken. Eerst tien mensen, dan honderd, duizend,
          tienduizend... Misschien begint het te leven op sociale media, wordt het gedeeld door
          iemand met een groot bereik en
          <GoldLine>haalt dit knotsgekke verhaal op een dag zelfs de media.</GoldLine>
        </P>
        <P>
          Dan kunt u zeggen:
          <Quote block>
            “Ik was erbij. Ik heb meegedaan. Ik heb geholpen om dit verhaal aan het rollen te
            krijgen.”
          </Quote>
        </P>
        <P>
          En wie weet bent u uiteindelijk zelfs één van de vier mensen die daadwerkelijk met de Urus
          mag rijden.
        </P>
      </Beat>

      <GoldTitle>DUS HEB IK NOG ÉÉN VRAAG AAN U</GoldTitle>

      <Beat>
        <P>
          Als u tot hier gelezen hebt, hebt u waarschijnlijk méér tijd aan mijn droom besteed dan
          het kost om effectief mee te doen. Denk dus niet:
          <GoldLine>“Iemand anders zal die €2 wel storten”</GoldLine>
        </P>
        <P>want die andere persoon denkt misschien precies hetzelfde.</P>
      </Beat>

      <Beat>
        <P>
          Het werkt alleen als u denkt:
          <GoldLine>“Kom. Waarom eigenlijk niet?”</GoldLine>
        </P>
        <P>
          Eén minuut, één kleine betaling, €2. Niet omdat ik u een zielig verhaal heb verteld of
          beweer dat ik recht heb op een Lamborghini, maar gewoon omdat u het idee misschien even
          knotsgek, grappig en spannend vindt als ik — en benieuwd bent naar het antwoord op één
          vraag:
        </P>
      </Beat>

      <GoldTitle as="h2">
        KUNNEN 200.000 MENSEN MET ELK €2 ÉÉN BIJNA ONMOGELIJKE DROOM WAARMAKEN?
      </GoldTitle>

      <Beat>
        <P>
          Misschien lukt het nooit. Misschien wordt het één grote mislukking waar ik later
          hartelijk om kan lachen.
          <GoldLine>Maar misschien lukt het wél.</GoldLine>
        </P>
        <P>
          En als ik ooit voor die Lamborghini Urus sta, zal ik weten dat hij daar niet staat dankzij
          één rijke schenker, maar dankzij duizenden mensen die allemaal hetzelfde dachten:
        </P>
      </Beat>

      <GoldTitle as="h2">“ACH KOM. VOOR €2 DOE IK MEE.”</GoldTitle>

      <Beat>
        <P>
          Dan hebben heel veel mensen met een piepkleine actie één mens ongelooflijk gelukkig
          gemaakt. Misschien was u één van hen, misschien hebt u geholpen het verhaal groot te maken
          en misschien zit u uiteindelijk zelfs zelf achter het stuur.
        </P>
        <P>
          <Em>Maar daarvoor moet iemand beginnen. Waarom niet u?</Em>
          <MoreBtn expanded onToggle={onCollapse} />
        </P>
      </Beat>
    </div>
  );
}

function StoryCta() {
  return (
    <div className="clear-both pt-8">
      <Link href="/meedoen" className="btn-yellow">
        Ik doe mee voor €2
      </Link>
      <p className="mt-4 max-w-2xl text-sm text-white/70 md:text-base">
        <Em>Doe mee. Deel uw persoonlijke link. Verzamel punten. Laat het verhaal groeien.</Em>
      </p>
    </div>
  );
}

export function HomeStory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="verhaal" className="relative overflow-hidden bg-black pt-16 pb-10 md:pt-24 md:pb-14">
      <img
        src="/images/urus-dusk.png?v=20260908a"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.05]"
      />
      <div className="relative mx-auto max-w-7xl px-5">
        <p className="mb-3 font-display text-[0.75rem] tracking-[0.28em] text-yellow">Verhaal</p>
        <div className="story-heading-fit">
          <h2 className="font-display leading-[1.12] tracking-tight">
            <span className="text-yellow">MIJN DROOM. UW €2. ONS VERHAAL.</span>
            <span className="story-heading-aside text-white/40">
              misschien lukt het,
              <span className="story-heading-gap-lg">misschien niet</span>
              <span className="story-heading-gap-sm">....</span>
              <span className="story-heading-gap-lg">maar mijn gekste idee ooit</span>
            </span>
          </h2>
        </div>

        <article className="story-layout mt-8 md:mt-10">
          <StoryPreview expanded={expanded} onToggle={() => setExpanded(true)} />
          {expanded ? <StoryRest onCollapse={() => setExpanded(false)} /> : null}
          <StoryCta />
        </article>
      </div>
    </section>
  );
}
