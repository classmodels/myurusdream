import { LegalPage } from "@/components/LegalPage";

export default function WinactieVoorwaardenPage() {
  return (
    <LegalPage title="Voorwaarden eventuele winactie">
      <p>
        Er is op dit moment geen publieke winactie. `PRIZE_FEATURE_ENABLED` staat op false.
        Onderstaande tekst is een ontwerp voor het geval de actie later wettelijk mag.
      </p>
      <p>
        Week 1 — geluk: uit geldige, betaalde deelnemers kan één persoon geloot worden voor
        maximaal één week gebruik van het voertuig, onder verzekerings- en gebruiksvoorwaarden.
      </p>
      <p>
        Week 2 — inspanning: alleen indien een aparte, juridisch goedgekeurde wedstrijd
        actief is. Multi-level constructies blijven uit.
      </p>
      <p>
        Brandstof, schade, rijbewijs, leeftijd en verzekering worden in een aparte
        gebruiksovereenkomst geregeld vóór eventuele overhandiging van sleutels.
      </p>
    </LegalPage>
  );
}
