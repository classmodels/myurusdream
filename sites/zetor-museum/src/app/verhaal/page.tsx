import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { PhotoGrid } from "@/components/PhotoGrid";
import { museumPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Verhaal",
};

export default function VerhaalPage() {
  const hero = museumPhotos[1];
  const side = museumPhotos.find((p) => p.src.includes("123_9776")) ?? museumPhotos[20];

  return (
    <>
      <PageHero
        eyebrow="Drijvende kracht"
        title="Herman Michiels"
        lead="Van jeugdherinnering met de eerste familietractor tot een museumhal vol gerestaureerd staal in Houtvenne."
        image={hero.src}
        imageAlt={hero.alt}
      />

      <section className="border-b border-steel">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-20">
          <div className="space-y-5 text-ink-dim leading-relaxed">
            <p>
              Drijvende kracht achter het Zetor-museum is <strong className="text-ink">Herman Michiels</strong>.
              In de regio is hij vooral bekend als bedrijfsleider van loonwerken Michiels H.,
              gevestigd aan de Koppenstraat te Booischot.
            </p>
            <p>
              Het Tsjechische tractormerk Zetor ligt Herman sinds zijn jeugdjaren nauw aan het hart.
              De eerste tractor die zijn vader <strong className="text-ink">Jules Michiels</strong> aankocht
              in januari 1966 was immers van het merk Zetor — een rode Zetor 3511 op het gemengde
              familiebedrijf in Booischot.
            </p>
            <p>
              De sympathie voor Zetor is altijd gebleven. In de loop der jaren bouwde Herman een
              unieke collectie uit: van de eerste Zetor 25 via de Super 35- en 50-typen tot de
              UR1- en Crystal-modelseries. Het merendeel is zodanig gerestaureerd dat ze zowel
              technisch als optisch puntgaaf zijn — zodat men kan stellen dat de Zetor-collectie
              van Herman uniek is in de wereld.
            </p>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden rounded-sm">
            <Image src={side.src} alt={side.alt} fill className="object-cover" sizes="45vw" />
          </div>
        </div>
      </section>

      <section className="border-b border-steel bg-hangar-2">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-brass uppercase">
            Wortels in Booischot
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-wide md:text-5xl">
            Familie, paarden &amp; de eerste Zetor
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="space-y-4 text-sm leading-relaxed text-ink-dim md:text-base">
              <p>
                Herman groeide op in Booischot waar zijn ouders, Jules Michiels en Elza Hoefkens,
                een gemengd bedrijf uitbaatten van ruim 40 hectare met 35 melkkoeien en jongvee.
                Samen met zijn zussen en broer Boni werd hij van jongs af aan ingeschakeld in het
                toen nog vele en zware handwerk rond de boerderij.
              </p>
              <p>
                Vader Jules was een echte paardenliefhebber: voor ploegen, eggen, maaien, binden,
                schudden en het vervoeren van hooi en stro werd het trekpaard ingezet. Toch
                verscheen in januari 1966 de eerste tractor — en voor Herman en Boni ging een
                nieuwe wereld open.
              </p>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-ink-dim md:text-base">
              <p>
                Vader Michiels onderwees hen, ondanks zijn voorliefde voor paardentractie, op een
                diplomatieke en vrije manier in het omgaan met tractor en landbouwmachines. Al snel
                ploegden Herman en Boni als de besten en voerden ze veldwerkzaamheden uit met deze
                universele Zetor.
              </p>
              <p>
                Buren zagen het: in zijn vrije tijd werd Herman gespot met de Zetor en een
                éénscharige Hert-ploeg, of maaiend met de Busatis-messenbalk. Hij combineerde dit
                met studies in Heist-op-den-Berg (A2-elektromechanica, specialisatie motorenbouw)
                en werk als mechanieker-fotolasser bij Hercules in Paal-Beringen — ook ’s nachts
                toen hij in 1979 als zelfstandig loonwerker startte.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-steel">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-zetor uppercase">
            Vanaf 1979
          </p>
          <h2 className="font-display mt-2 text-4xl tracking-wide md:text-5xl">
            Loonwerk &amp; passie voor machines
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-ink-dim leading-relaxed">
            <p>
              Herman Michiels begon in 1979 met landbouwloonwerk. Zijn eerste tractor op het
              loonbedrijf was een <strong className="text-ink">Hanomag Brillant 600</strong> —
              vandaar het grote aantal Hanomag-tractoren in de verzameling.
            </p>
            <p>
              Parallel bouwde hij expertise op in restauratie en onderhoud. Die kennis leeft
              vandaag voort in het museum én in URZET-Services: aankoop/verkoop, herstelling en
              onderdelen voor Zetor- en Ursus-tractoren.
            </p>
            <p>
              Het museum is breed opgezet: niet alleen tractoren, maar ook een gestaag groeiende
              collectie prospectussen, handleidingen, wisselstukkenboeken, miniaturen, gadgets,
              zeldzame foto’s en kalenders — én landbouwmachines die het erfgoed van de regio
              Heist-op-den-Berg belichten.
            </p>
          </div>
          <div className="mt-10">
            <PhotoGrid photos={museumPhotos.filter((p) => p.group === "detail").slice(0, 6)} />
          </div>
        </div>
      </section>
    </>
  );
}
