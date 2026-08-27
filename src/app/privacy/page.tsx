import { LegalPage } from "@/components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacybeleid">
      <p>
        Wij verzamelen minimale gegevens: e-mail, eventueel naam, IP-adres voor beveiliging,
        betalingsstatus via de betaalprovider, en uw toestemming voor voorwaarden.
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
    </LegalPage>
  );
}
