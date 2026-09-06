import { LegalPage } from "@/components/LegalPage";

export default function VoorwaardenPage() {
  return (
    <LegalPage title="Algemene voorwaarden">
      <section id="algemene-voorwaarden">
        <h2 className="font-display text-2xl text-yellow">Algemene voorwaarden</h2>
        <div className="mt-3 space-y-2">
          <p>
            Deze voorwaarden gelden voor het gebruik van de website myurusdream.be en de
            deelname aan de persoonlijke campagne van de organisator.
          </p>
          <p>
            myurusdream.be is geen goed doel, geen beleggingsproduct en geen belofte op winst, rendement
            of eigendom van een voertuig. Een bijdrage van €2 is vrijwillig. U mag meerdere keren
            €2 storten; er wordt nooit automatisch opnieuw geïnd.
          </p>
          <p>
            Betalingen verlopen via een externe betaalprovider (Mollie). myurusdream.be slaat geen
            kaart- of Bancontactgegevens op.
          </p>
          <p>
            De organisator kan de campagne pauzeren, betalingen tijdelijk stopzetten of de
            communicatie actualiseren wanneer dat nodig is voor wettelijke of operationele
            redenen.
          </p>
          <p>
            Aansprakelijkheid voor indirecte schade is, voor zover wettelijk toegelaten, uitgesloten.
            Verplichte wettelijke rechten van de consument blijven onverlet.
          </p>
          <p>
            Toepasselijk recht en bevoegde rechtbanken worden vastgelegd in de definitieve
            juridische versie van dit document, samen met de identiteit van de organisator.
          </p>
        </div>
      </section>

      <hr className="my-8 border-0 border-t border-white/15" />

      <section id="campagnevoorwaarden">
        <h2 className="font-display text-2xl text-yellow">Campagnevoorwaarden</h2>
        <div className="mt-3 space-y-2">
          <p>
            De campagne myurusdream.be vraagt tot 200.000 vrijwillige bijdragen van €2, met een
            brutodoel van €400.000. Dat brutobedrag is niet automatisch gelijk aan de
            aankoopprijs van een voertuig.
          </p>
          <p>
            Dit is een open, persoonlijke campagne. Het is geen liefdadigheid, geen
            investeringsaanbod en geen loterij zolang een winactie niet juridisch is goedgekeurd
            en publiek geactiveerd.
          </p>
          <p>
            Wat er gebeurt als het doel niet wordt bereikt, moet vóór betaling vastliggen
            (terugbetaling, verlenging of een vooraf omschreven alternatief) en wordt getoond op
            de betaalpagina.
          </p>
          <p>
            Na een bevestigde €2 krijgt u 5 punten, een lotnummer en een klein dashboard-account.
            U mag zo vaak extra €2 storten als u wilt: elke storting telt 5 punten bij én geeft
            een extra lotnummer (tien stortingen = tien kansen in de loting). U blijft ingelogd;
            extra storten vraagt geen nieuwe gegevens. Inloggen kan met e-mailadres én gsm-nummer.
            Deelt u na uw storting via WhatsApp, Facebook of e-mail op de site, dan zit uw
            persoonlijke code in de link. Wie via die link stort, houdt 5 punten; u krijgt +2.
            Elke verdere bevestigde storting in uw lijn: +1 punt. De nieuwe storter krijgt nooit
            extra punten omdat hij via een link kwam. Nog niet gestort? Delen kan, zonder punten.
            Als het doel van €400.000 gehaald is, gaan twee weekends naar de hoogste punten
            (inspanning) en twee weekends naar een live loting uit de lotinglijst. Zonder gehaald
            doel is er geen trekking en geen weekend.
          </p>
          <p>
            De teller toont alleen bevestigde betalingen. Er worden geen fictieve bedragen
            gepubliceerd.
          </p>
        </div>
      </section>

      <hr className="my-8 border-0 border-t border-white/15" />

      <section id="privacybeleid">
        <h2 className="font-display text-2xl text-yellow">Privacybeleid</h2>
        <div className="mt-3 space-y-2">
          <p>
            Wij verzamelen minimale gegevens: e-mail, voornaam, achternaam, gsm-nummer, IP-adres
            voor beveiliging, betalingsstatus via de betaalprovider, en uw toestemming voor
            voorwaarden. Voor een pixelfactuur vragen we ook bedrijfsnaam, adres en btw-nummer.
          </p>
          <p>
            Doeleinden: uitvoering van de campagne, betalingsverwerking, fraudepreventie,
            wettelijke verplichtingen en — alleen na aparte toestemming — updates per e-mail.
            Nieuwsbrieven staan nooit vooraf aangevinkt.
          </p>
          <p>
            Rechtsgrond: overeenkomst (deelname/betaling), wettelijke plicht en gerechtvaardigd
            belang voor beveiliging. Definitieve grondslagen volgen na juridische controle.
          </p>
          <p>
            U kunt inzage, verbetering, beperking, bezwaar of verwijdering vragen waar dat
            wettelijk past. Export van uw gegevens is beschikbaar via het dashboard na login.
            Bewaartermijnen worden vastgelegd in de definitieve versie.
          </p>
          <p>
            Betalingsgegevens worden verwerkt door Mollie. Wij ontvangen geen volledige
            kaartnummers.
          </p>
        </div>
      </section>
    </LegalPage>
  );
}
