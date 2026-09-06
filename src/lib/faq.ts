import { LIVE_DRAW } from "./constants";

export const DEFAULT_FAQS: { question: string; answer: string; legal: boolean }[] = [
  {
    question: "Is dit een goed doel?",
    answer:
      "Nee. Dit is geen goed doel, geen investering en geen belofte op winst. myurusdream.be is een open, persoonlijke campagne: één initiatiefnemer vraagt vrijwillige bijdragen van €2 om een autodroom mogelijk te maken.",
    legal: false,
  },
  {
    question: "Waarom €2?",
    answer:
      "Omdat €2 voor de meeste mensen een klein, eenmalig bedrag is. Niet één persoon €400.000 vragen, maar 200.000 mensen elk €2 van die droom laten dragen: 200.000 × €2 = €400.000.",
    legal: false,
  },
  {
    question: "Waar gaat het geld naartoe?",
    answer:
      "Naar deze persoonlijke campagne, met als doel een Lamborghini Urus mogelijk te maken. Het brutodoel van €400.000 is niet automatisch de aankoopprijs van de wagen. De teller toont bruto ontvangen bijdragen minus transactiekosten. De uitsplitsing staat op Volg alles.",
    legal: false,
  },
  {
    question: "Wat gebeurt er als €400.000 niet wordt bereikt?",
    answer:
      "Er is geen garantie dat het doel gehaald wordt. Wordt het niet gehaald, dan blijft uw steun staan: €2-bijdragen en sponsorgeld worden niet teruggestort. Afhankelijk van het opgehaalde bedrag gaat dat geld naar een ander voertuig. De campagne kan na de afloopdatum verlengd of stopgezet worden.",
    legal: false,
  },
  {
    question: "Kan ik meer dan €2 bijdragen?",
    answer:
      "De persoonlijke bijdrage is telkens €2, maar u mag dat zo vaak herhalen als u wilt. Elke extra storting is +5 punten en een extra lotnummer. Grotere bedragen lopen via sponsoring (vanaf €500) of de Pixelwall (vanaf €10).",
    legal: false,
  },
  {
    question: "Is €2 een abonnement?",
    answer:
      "Nee. Er wordt nooit automatisch opnieuw geïnd. Elke extra €2 doet u zelf, wanneer u wilt.",
    legal: false,
  },
  {
    question: "Kan ik mijn betaling annuleren?",
    answer:
      "Een bijdrage is een eenmalige, vrijwillige betaling. €2 en sponsorgeld worden in beginsel niet teruggestort. Dubbele betalingen of duidelijke fouten kunnen na controle worden teruggestort. Meer info op de pagina Terugbetaling.",
    legal: false,
  },
  {
    question: "Hoe werkt de teller?",
    answer:
      "De teller telt alleen bevestigde betalingen. Het getoonde totaal is bruto minus transactiekosten. Er worden geen fictieve bedragen getoond. Iedereen kan de stand volgen op de homepage en op Volg alles.",
    legal: false,
  },
  {
    question: "Hoe worden betalingen gecontroleerd?",
    answer:
      "Betalingen lopen via Mollie. myurusdream.be slaat geen kaart- of Bancontactgegevens op. Alleen een bevestigde status via de betaalprovider telt mee voor de teller.",
    legal: false,
  },
  {
    question: "Hoe werkt een eventuele winactie?",
    answer:
      "Alleen als het doel van €400.000 gehaald is. Dan zijn er vier weekends met de wagen: twee voor wie het meest deelt (hoogste punten), twee via live loting. Zonder gehaald doel is er geen trekking en geen weekend.",
    legal: false,
  },
  {
    question: "Hoe wordt een winnaar aangeduid?",
    answer:
      "Twee weekends gaan naar de hoogste punten. De twee andere bepaalt het lot uit de lotinglijst: elke €2 is een apart nummer, tien stortingen is tien kansen. Alles is live te volgen.",
    legal: false,
  },
  {
    question: "Wie mag deelnemen?",
    answer:
      "Deelname is bedoeld voor meerderjarigen die de voorwaarden aanvaarden en vrijwillig €2 storten. De precieze regels staan in de algemene voorwaarden.",
    legal: false,
  },
  {
    question: "Welke voorwaarden gelden om met de wagen te rijden?",
    answer:
      "Nog niet van toepassing. Eventueel gebruik vereist geldig rijbewijs, verzekering en aparte gebruiksvoorwaarden.",
    legal: true,
  },
  {
    question: "Wie betaalt brandstof?",
    answer:
      "Nog niet vastgelegd. Dat komt in de gebruiksvoorwaarden van de winactie, mocht het doel gehaald worden.",
    legal: true,
  },
  {
    question: "Wie betaalt verzekering?",
    answer:
      "De organisator is verantwoordelijk voor een wettelijk correcte verzekering van het voertuig, als het wordt aangekocht. Details volgen in de gebruiksvoorwaarden.",
    legal: true,
  },
  {
    question: "Wat bij schade?",
    answer:
      "Nog niet van toepassing. Schade, franchise en aansprakelijkheid horen in aparte gebruiksvoorwaarden, mocht er een weekend met de wagen plaatsvinden.",
    legal: true,
  },
  {
    question: "Wat gebeurt er wanneer de wagen nog niet geleverd is?",
    answer:
      "De status van aankoop en levering staat op Volg alles. Er is geen belofte van een leverdatum.",
    legal: false,
  },
  {
    question: "Hoe worden persoonsgegevens beschermd?",
    answer:
      "We vragen alleen wat nodig is: e-mail, naam, gsm-nummer en betalingsstatus. Betalingen verwerkt Mollie; wij ontvangen geen kaartnummers. Nieuwsbrieven staan nooit vooraf aangevinkt. Zie het privacybeleid.",
    legal: false,
  },
  {
    question: "Hoe kan ik contact opnemen?",
    answer: "Via de contactpagina. Daar staan de gegevens van de organisator.",
    legal: false,
  },
  {
    question: "Kunnen bedrijven de campagne sponsoren?",
    answer:
      "Ja. Merken storten een bedrag naar keuze, vanaf €500. Hoe groter het bedrag, hoe groter de plek op de site: Bronze €500, Silver €2.500, Gold €10.000, Hoofdsponsor €25.000. Het bedrag telt mee voor het campagnedoel.",
    legal: false,
  },
  {
    question: "Wat is de pixelmuur?",
    answer:
      "Een muur van kleine vakken. Zelfstandigen kopen vanaf €10 een vak (of een groter blok) met logo, naam en optionele link. Hoe meer vakken, hoe groter de reclame. Het bedrag telt mee voor het campagnedoel.",
    legal: false,
  },
  {
    question: "Wanneer worden de vier weekends verdeeld?",
    answer: `Alleen als het doel van €400.000 gehaald is: live op ${LIVE_DRAW.dateLabel}, op een spectaculaire locatie in België, gestreamd voor iedereen die meedeed. Twee weekends gaan naar de hoogste punten, twee naar de loting. De exacte plek wordt later bekendgemaakt.`,
    legal: false,
  },
  {
    question: "Hoe werken de punten?",
    answer:
      "Elke €2-storting levert 5 punten op, bijgeteld bij u. Deelt u na uw storting via WhatsApp, Facebook of e-mail op de site, dan zit uw code in de link: wie dan stort, houdt 5 punten en u krijgt +2. Stort iemand verder in uw lijn: u krijgt +1. Nog niet gestort? Delen kan, maar zonder punten.",
    legal: false,
  },
  {
    question: "Hoe log ik in op mijn dashboard?",
    answer:
      "Na uw storting krijgt u automatisch een klein account en blijft u ingelogd op dat toestel. Bent u uitgelogd, dan opent u het dashboard met hetzelfde e-mailadres én gsm-nummer als bij uw storting. Extra €2 storten vraagt geen nieuwe gegevens.",
    legal: false,
  },
  {
    question: "Mag ik meerdere keren €2 storten?",
    answer:
      "Ja. Elke extra €2 is vijf punten extra en een extra lotnummer. Tien stortingen is tien kansen bij de live loting. Twee weekends gaan naar de hoogste punten, twee andere worden uit die lotinglijst getrokken — alleen als het doel gehaald is.",
    legal: false,
  },
];
