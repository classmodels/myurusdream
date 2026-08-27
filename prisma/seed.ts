import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CHECKLIST } from "../src/lib/constants";

const prisma = new PrismaClient();

const STORY = `Ik ga u geen verhaal vertellen over een goed doel.

Ik ga u niet proberen overtuigen met een ziekte, een drama of een verzonnen reden.

Mijn reden is veel eenvoudiger.

Ik droom al heel mijn leven van een uitzonderlijke wagen.

Ik heb jarenlang gereden met oudere en gewone auto's en een Lamborghini Urus kopen uit eigen middelen is voor mij simpelweg niet realistisch.

Daarom wil ik één keer iets totaal anders proberen.

Niet één persoon €400.000 vragen.

Maar 200.000 mensen vragen of ze ieder €2 van die droom willen dragen.

Voor één persoon is €2 een klein bedrag.

200.000 keer €2 kan iets ongelooflijks mogelijk maken.

Of het lukt?

Ik heb geen idee.

Maar ik wil het één keer geprobeerd hebben.

En iedereen moet vanaf dag één kunnen volgen wat er gebeurt.`;

const FAQS: { question: string; answer: string; legal: boolean }[] = [
  {
    question: "Is dit een goed doel?",
    answer:
      "Nee. DroomOp2 is geen goed doel, geen liefdadigheid en geen hulporganisatie. Het is een open, persoonlijke campagne: één initiatiefnemer vraagt vrijwillige bijdragen van €2 om een autodroom mogelijk te maken.",
    legal: false,
  },
  {
    question: "Waarom €2?",
    answer:
      "Omdat €2 voor de meeste mensen een klein, eenmalig bedrag is. Het idee is niet één grote gift, maar heel veel kleine, vrijwillige bijdragen: 200.000 × €2 = €400.000 bruto.",
    legal: false,
  },
  {
    question: "Waar gaat het geld naartoe?",
    answer:
      "Naar de persoonlijke campagne van de initiatiefnemer, met als doel een Lamborghini Urus mogelijk te maken. Het brutodoel van €400.000 is niet automatisch de aankoopprijs. Transactiekosten, belastingen, verzekering, inschrijving en administratie kunnen het beschikbare bedrag verlagen. De uitsplitsing staat op de site en is vanuit het adminpaneel aanpasbaar. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wat gebeurt er als €400.000 niet wordt bereikt?",
    answer:
      "Dat wordt vóór de eerste echte betaling vastgelegd in het adminpaneel (terugbetaling, verlenging of een vooraf omschreven alternatief) en getoond op de betaalpagina. Zolang die keuze niet is ingesteld, kan er niet betaald worden. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Kan ik meer dan €2 bijdragen?",
    answer:
      "In deze eerste versie is de bijdrage vast op €2 per deelnemer. Eventuele extra bedragen volgen alleen als dat later duidelijk op de site wordt aangekondigd.",
    legal: false,
  },
  {
    question: "Is €2 een abonnement?",
    answer:
      "Nee. Het is een eenmalige bijdrage. Er wordt nooit automatisch opnieuw geïnd.",
    legal: false,
  },
  {
    question: "Kan ik mijn betaling annuleren?",
    answer:
      "Herroepings- en terugbetalingsrechten hangen af van de definitieve campagnevoorwaarden en het toepasselijke recht. Zie de pagina Terugbetaling. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Hoe werkt de teller?",
    answer:
      "De teller telt alleen bevestigde betalingen uit de database. Er worden geen fictieve bedragen getoond. Zonder betalingen ziet u €0 / €400.000 en 0 deelnemers.",
    legal: false,
  },
  {
    question: "Hoe worden betalingen gecontroleerd?",
    answer:
      "Betalingen lopen via Mollie (hosted checkout). Deze site slaat geen kaartgegevens op. Alleen een bevestigde status via de betaalprovider telt mee voor de teller.",
    legal: false,
  },
  {
    question: "Hoe werkt een eventuele winactie?",
    answer:
      "Een eventuele week rijden of extra week via punten is standaard UITGESCHAKELD tot juridische goedkeuring (PRIZE_FEATURE_ENABLED = false). [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Hoe wordt een winnaar aangeduid?",
    answer:
      "Indien ooit geactiveerd: uniek deelnemersnummer, afgesloten lijst, hash, cryptografisch veilige loting en auditlog. Dit is nu niet publiek actief. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wie mag deelnemen?",
    answer:
      "Meerderjarigen die de voorwaarden aanvaarden. Precieze leeftijds- en woonplaatsregels volgen in de definitieve voorwaarden. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Welke voorwaarden gelden om met de wagen te rijden?",
    answer:
      "Nog niet van toepassing. Eventueel gebruik vereist geldig rijbewijs, verzekering en aparte gebruiksvoorwaarden. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wie betaalt brandstof?",
    answer:
      "Nog niet vastgelegd. Wordt opgenomen in eventuele gebruiksvoorwaarden van een winactie. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wie betaalt verzekering?",
    answer:
      "De organisator is verantwoordelijk voor een wettelijk correcte verzekering van het voertuig indien het wordt aangekocht. Details volgen. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wat bij schade?",
    answer:
      "Nog niet van toepassing. Schade, franchise en aansprakelijkheid horen in aparte voorwaarden. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Wat gebeurt er wanneer de wagen nog niet geleverd is?",
    answer:
      "De status van aankoop en levering wordt bijgewerkt op de pagina Volg alles mee. Er is geen belofte van een leverdatum.",
    legal: false,
  },
  {
    question: "Hoe worden persoonsgegevens beschermd?",
    answer:
      "We vragen alleen wat nodig is voor betaling, bevestiging en wettelijke plichten. Zie het privacybeleid. [JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]",
    legal: true,
  },
  {
    question: "Hoe kan ik contact opnemen?",
    answer:
      "Via de contactpagina. Zolang de organisatorgegevens niet definitief zijn, is het contactadres het lokale admin-adres uit de README.",
    legal: false,
  },
];

const MONEY = [
  {
    key: "gross",
    label: "Bruto ontvangen bijdragen",
    cents: 0,
    dynamic: true,
    note: "Som van alle bevestigde betalingen. Geen fictieve cijfers.",
  },
  {
    key: "fees",
    label: "Transactiekosten",
    cents: 0,
    note: "Schatting. Exacte kosten volgen uit de betaalprovider.",
  },
  {
    key: "tax",
    label: "Belastingen indien van toepassing",
    cents: 0,
    note: "Nog te bepalen na fiscale controle.",
  },
  {
    key: "legal",
    label: "Juridische en administratieve kosten",
    cents: 0,
  },
  {
    key: "vehicle",
    label: "Aankoopprijs voertuig (indicatief)",
    cents: 0,
    note: "€400.000 is het brutodoel, niet automatisch de aankoopprijs.",
  },
  { key: "insurance", label: "Verzekering", cents: 0 },
  { key: "registration", label: "Inschrijving", cents: 0 },
  { key: "other", label: "Overige kosten", cents: 0 },
  {
    key: "remainder",
    label: "Resterend bedrag",
    cents: 0,
    dynamic: true,
    note: "Bruto minus de hierboven ingevulde posten.",
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@droomop2.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "admin" },
    create: {
      email: adminEmail,
      firstName: "Admin",
      participantNumber: 0,
      referralCode: "admin",
      role: "admin",
      passwordHash,
    },
  });

  await prisma.campaign.upsert({
    where: { slug: "droomop2" },
    update: {},
    create: {
      slug: "droomop2",
      name: "DroomOp2",
      status: "draft",
      goalCents: 40_000_000,
      contributionCents: 200,
      targetContributions: 200_000,
      storyText: STORY,
      organizerEmail: adminEmail,
      organizerName: "Nog in te vullen — organisator",
      moneyBreakdownJson: JSON.stringify(MONEY),
      checklistJson: JSON.stringify(DEFAULT_CHECKLIST),
      referralPublicEnabled: false,
      prizeFeatureEnabled: false,
      multiLevelEnabled: false,
      liveMode: false,
      paymentsEnabled: true,
      paymentsPaused: false,
    },
  });

  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { slug: "droomop2" },
  });

  const updateCount = await prisma.campaignUpdate.count({
    where: { campaignId: campaign.id },
  });
  if (updateCount === 0) {
    await prisma.campaignUpdate.create({
      data: {
        campaignId: campaign.id,
        title: "De site staat klaar. De teller start op nul.",
        body: "Er is nog geen enkele betaling. Wat u ziet (€0 / €400.000) is de echte stand. Er worden geen demo-bedragen getoond.",
        published: true,
      },
    });
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: FAQS.map((f, i) => ({
        question: f.question,
        answer: f.answer,
        legalReview: f.legal,
        sortOrder: i + 1,
        published: true,
      })),
    });
  }

  console.log("Seed OK. Admin:", adminEmail);
  console.log("ZERO payments seeded. Counter must show €0.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
