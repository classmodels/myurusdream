export const brand = {
  name: "SiteButler",
  tagline: "Uw website, onze zorg.",
  phone: "+32 (0)470 00 00 00",
  email: "hallo@sitebutler.be",
} as const;

export const navLinks = [
  { href: "/diensten", label: "Diensten" },
  { href: "/prijzen", label: "Prijzen" },
  { href: "/portfolio", label: "Referenties" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
] as const;

export const packages = [
  {
    id: "essentie",
    name: "Essentie",
    price: "€1.250",
    tag: "Eenvoudige website",
    description:
      "Een professionele presentatiesite voor lokale ondernemers en dienstverleners die snel en duidelijk online willen staan.",
    features: [
      "Tot 5 pagina's op maat",
      "Responsive op desktop en mobiel",
      "Contactformulier en basis-SEO",
      "Google Analytics-configuratie",
      "Eén feedbackronde op het ontwerp",
      "Livegang inclusief korte toelichting",
    ],
    highlight: false,
  },
  {
    id: "compleet",
    name: "Compleet",
    price: "€2.995",
    tag: "Website met backend",
    description:
      "Een volwaardige website met beheeromgeving. Ideaal wanneer u zelf content wilt aanpassen zonder technische tussenkomst.",
    features: [
      "Tot 12 pagina's plus nieuwsmodule",
      "CMS / backend voor zelfbeheer",
      "Design afgestemd op uw sector",
      "SEO-structuur en performance",
      "Formulieren en basisintegraties",
      "Twee feedbackrondes + 30 dagen nazorg",
    ],
    highlight: true,
  },
  {
    id: "maatwerk",
    name: "Op maat",
    price: "Op aanvraag",
    tag: "Volledig maatwerk",
    description:
      "Voor organisaties met specifieke eisen: webshops, meertalige platforms, klantportalen of complexe integraties.",
    features: [
      "Scope en architectuur op maat",
      "E-commerce of webapplicatie",
      "API-koppelingen en workflows",
      "Meertaligheid en toegankelijkheid",
      "Dedicated aanspreekpunt",
      "SLA met 24/7 prioritaire support",
    ],
    highlight: false,
  },
] as const;

/** Hosting & beheer — doorlopend na oplevering */
export const carePackages = [
  {
    id: "care-basis",
    name: "Butler Care Basis",
    price: "€299",
    period: "/ jaar",
    tag: "Hosting & beheer",
    description:
      "Alles om uw site veilig online te houden. Ideaal na Essentie of als u vooral bereikbaarheid en kleine updates wilt.",
    features: [
      "Hosting op Vercel (snel & betrouwbaar)",
      "Domeinbeheer + gratis SSL",
      "Professionele e-mailkoppeling (via Combell)",
      "Monitoring & snelle herstart bij problemen",
      "Tot 30 min. kleine wijzigingen / maand",
      "Persoonlijk aanspreekpunt bij SiteButler",
    ],
    highlight: false,
  },
  {
    id: "care-plus",
    name: "Butler Care Plus",
    price: "€499",
    period: "/ jaar",
    tag: "Hosting, beheer & groei",
    description:
      "Voor wie vaker aanpassingen nodig heeft en liever één partner heeft voor site, domein en support.",
    features: [
      "Alles uit Care Basis",
      "Tot 90 min. wijzigingen / maand",
      "Prioritaire support (werkdagen)",
      "Jaarlijkse performance- & SEO-check",
      "Back-up / herstel bij incidenten",
      "Hulp bij teksten, foto’s en nieuwe secties",
    ],
    highlight: true,
  },
] as const;

export const contentPackages = [
  {
    title: "Logo & huisstijl",
    price: "vanaf €350",
    text: "Een herkenbaar logo met kleuren en toepassingsrichtlijnen voor web, print en social media.",
  },
  {
    title: "Teksten & copywriting",
    price: "vanaf €250",
    text: "Zakelijke, overtuigende paginateksten die uw aanbod helder maken en tot actie aanzetten.",
  },
  {
    title: "Fotografie",
    price: "vanaf €450",
    text: "Professionele beelden van uw zaak, team of producten — geoptimaliseerd voor het web.",
  },
  {
    title: "Bedrijfsvideo",
    price: "vanaf €650",
    text: "Korte, professionele video voor homepage of socials die vertrouwen en duidelijkheid geeft.",
  },
] as const;

export const services = [
  {
    slug: "websites",
    menuLabel: "Websites",
    title: "Websites ontwikkelen",
    color: "blue",
    summary:
      "Van presentatiesite tot webshop of maatwerkplatform. Technisch solide, commercieel doordacht en afgestemd op uw branche.",
    intro:
      "Wij bouwen websites die duidelijk maken wie u bent, wat u aanbiedt en waarom bezoekers contact moeten opnemen — snel live, met ruimte om later te groeien.",
    points: [
      "Structuur en design op basis van uw doelstellingen",
      "Snelle laadtijden, veiligheid en SEO-basis",
      "Offerte binnen 24 uur, eerste ontwerp binnen 48 uur",
    ],
    includes: [
      "Presentatiesite, website met CMS of volledig maatwerk",
      "Responsive ontwerp voor desktop en mobiel",
      "Contactformulieren, analytics en basis-SEO",
      "Livegang met korte toelichting",
      "Optioneel: Butler Care voor hosting & beheer",
    ],
    ctaTitle: "Klaar voor een website die werkt?",
  },
  {
    slug: "logos",
    menuLabel: "Logo's",
    title: "Logo- en merkidentiteit",
    color: "teal",
    summary:
      "Een sterke visuele identiteit die past bij uw organisatie — consistent toepasbaar op website en communicatie.",
    intro:
      "Een herkenbaar logo en heldere huisstijl zorgen dat uw merk overal hetzelfde aanvoelt: op de website, in print en op social media.",
    points: [
      "Logo in gangbare bestandsformaten",
      "Kleurenpalet en typografie",
      "Richtlijnen voor correct gebruik",
    ],
    includes: [
      "Logo-ontwerp of verfijning van bestaand merk",
      "Kleur- en lettertypekeuze",
      "Bestanden voor web, print en socials",
      "Eenvoudige toepassingsrichtlijnen",
    ],
    ctaTitle: "Uw merk scherp en herkenbaar?",
  },
  {
    slug: "teksten",
    menuLabel: "Teksten",
    title: "Teksten & content",
    color: "green",
    summary:
      "Wij schrijven heldere, zakelijke teksten die uw diensten uitleggen en bezoekers helpen beslissen.",
    intro:
      "Goede teksten maken het verschil tussen bezoekers die blijven hangen en bezoekers die contact opnemen. Wij schrijven helder, overtuigend en afgestemd op uw doelgroep.",
    points: [
      "Homepage-, diensten- en landingspagina's",
      "SEO-bewuste formulering",
      "Toon afgestemd op uw doelgroep",
    ],
    includes: [
      "Paginateksten voor website of landingspagina",
      "Structuur die tot actie aanzet",
      "SEO-vriendelijke formulering",
      "Afstemming op uw merktoon",
    ],
    ctaTitle: "Teksten die tot actie aanzetten?",
  },
  {
    slug: "fotos",
    menuLabel: "Fotografie",
    title: "Fotografie voor websites",
    color: "coral",
    summary:
      "Beeldmateriaal dat uw bedrijf geloofwaardig en herkenbaar maakt — beter dan generieke stockfoto's.",
    intro:
      "Echte beelden van uw zaak, team of producten wekken vertrouwen. Wij zorgen voor foto's die klaar zijn voor uw website.",
    points: [
      "Shoot op locatie of gerichte beeldselectie",
      "Selectie en nabewerking",
      "Web-geoptimaliseerde levering",
    ],
    includes: [
      "Fotografie op locatie of gerichte selectie",
      "Selectie van de sterkste beelden",
      "Nabewerking en webformaten",
      "Klaar voor homepage, diensten en socials",
    ],
    ctaTitle: "Beelden die uw zaak laten zien?",
  },
  {
    slug: "videos",
    menuLabel: "Video",
    title: "Video & motion",
    color: "blue",
    summary:
      "Korte bedrijfsfilms of uitlegvideo's die complexe boodschappen eenvoudig maken en vertrouwen opbouwen.",
    intro:
      "Een korte, professionele video op uw homepage of socials vertelt sneller dan tekst alleen — ideaal om vertrouwen en duidelijkheid te geven.",
    points: [
      "Concept, opname en montage",
      "Geschikt voor website en social media",
      "Consistent met uw merkuitstraling",
    ],
    includes: [
      "Concept en scenario op maat",
      "Opname en professionele montage",
      "Versies voor website en socials",
      "Afstemming op uw huisstijl",
    ],
    ctaTitle: "Korte video met impact?",
  },
  {
    slug: "support",
    menuLabel: "Butler Care",
    title: "Support & onderhoud",
    color: "teal",
    summary:
      "Na oplevering blijft u niet alleen. Snelle ondersteuning bij vragen, updates en spoedgevallen — 24/7.",
    intro:
      "Met Butler Care blijft uw site veilig online: hosting, domein, mail en een vast aanspreekpunt voor kleine wijzigingen.",
    points: [
      "Bereikbaarheid buiten kantooruren",
      "Kleine wijzigingen en technische fixes",
      "Optionele onderhoudsovereenkomst",
    ],
    includes: [
      "Hosting op Vercel",
      "Domeinbeheer en SSL",
      "E-mailkoppeling via Combell",
      "Monitoring en snelle support",
      "Maandelijks budget voor kleine wijzigingen",
    ],
    ctaTitle: "Liever één partner na livegang?",
  },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export const serviceNavLinks = [
  ...services.map((s) => ({ href: `/diensten/${s.slug}`, label: s.menuLabel })),
  { href: "/prijzen", label: "Prijzen" },
] as const;

/** Oplossingen-rail (webapps / software) — o.a. op /diensten/websites */
export const webSolutions = [
  {
    title: "Mobile web-apps",
    text: "Onze web apps geven u controle via uw smartphone.",
  },
  {
    title: "E-commerce",
    text: "Webshop op maat voor B2B of B2C.",
  },
  {
    title: "ERP-systemen",
    text: "Een online ERP-systeem op maat van uw processen.",
  },
  {
    title: "CRM-systemen",
    text: "Klantenbeheer en interactie. Online, snel en overzichtelijk!",
  },
  {
    title: "Online databanken",
    text: "Verzamel al uw gegevens in een overzichtelijke database.",
  },
] as const;

export const branches = [
  "Horeca & bakkerijen",
  "Retail & winkels",
  "Automotive & techniek",
  "Zorg & welzijn",
  "Bouw & industrie",
  "Professionele diensten",
  "Vastgoed",
  "Onderwijs & non-profit",
  "KMO's & scale-ups",
  "Middelgrote en grote organisaties",
] as const;

export const usps = [
  {
    title: "Offerte binnen 24 uur",
    text: "Duidelijke scope, planning en prijs — zonder verrassingen achteraf.",
  },
  {
    title: "Eerste ontwerp in 48 uur",
    text: "U beoordeelt snel de richting, afgestemd op uw sector en doelgroep.",
  },
  {
    title: "Volledig traject mogelijk",
    text: "Website, logo, teksten, fotografie en video vanuit één aanspreekpunt.",
  },
  {
    title: "Voor elke branche",
    text: "Van lokale zaak tot corporate omgeving — altijd zakelijk en resultaatgericht.",
  },
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Intake",
    text: "We inventariseren doelstellingen, doelgroep, content en technische wensen.",
  },
  {
    step: "02",
    title: "Offerte binnen 24 uur",
    text: "U ontvangt een heldere offerte met investering, opleveringstermijn en scope.",
  },
  {
    step: "03",
    title: "Concept binnen 48 uur",
    text: "Eerste ontwerprichting, eventueel aangevuld met logo- of tekstvoorstellen.",
  },
  {
    step: "04",
    title: "Realisatie",
    text: "Development, contentproductie en tests — met vaste feedbackmomenten.",
  },
  {
    step: "05",
    title: "Livegang & support",
    text: "Publicatie, overdracht en 24/7 ondersteuning na oplevering.",
  },
] as const;

export const portfolio = [
  {
    title: "Class-Models",
    url: "https://www.class-models.be",
    urlLabel: "class-models.be",
    sector: "Modellenbureau",
    result: "Website + 3 portalen + online agenda",
    summary:
      "Geen visitekaartje, maar een werkend bureau: gasten boeken een testshoot, modellen beheren hun profiel, merken vragen castings aan.",
    brief:
      "Het bureau wou meer dan een mooie homepage. Nieuwe gezichten moesten zelf een gratis testshoot, casting of intake kunnen plannen. Contractmodellen en merken hadden elk een eigen, beveiligde omgeving nodig — zonder alles via mail te laten lopen.",
    capabilities: [
      "Online inschrijven en afspraken boeken (testshoot, casting, intake)",
      "Gastenportaal voor wie model wil worden — zonder ervaring",
      "Modellenportaal: profiel, opdrachten, portfolio en communicatie",
      "Klantenportaal: modellen selecteren, casting aanvragen, boekingen",
      "Publieke wervende site (SEO, mobile, duidelijke calls-to-action)",
    ],
    tags: ["Maatwerk", "Portalen", "Booking", "Mobile"],
    backend:
      "Het bureau stuurt alles vanuit één beheeromgeving — geen losse mails of Excel.",
    backendItems: [
      "Agenda: testshoots, castings en intakes bevestigen of verzetten",
      "Gasten, contractmodellen en merken in één overzicht",
      "Boekingen, opdrachten en communicatie opvolgen",
      "Profielen, foto’s en status (nieuw / actief / geboekt) beheren",
    ],
  },
  {
    title: "ModelPort",
    url: "https://www.modelport.be",
    urlLabel: "modelport.be",
    sector: "Platform / marketplace",
    result: "Van casting tot booking op één plek",
    summary:
      "Benelux-platform waar modellen, fotografen, visagisten en kledingzaken elkaar rechtstreeks vinden — zonder klassiek bureau als tussenpersoon.",
    brief:
      "De vraag was een open marktplaats, geen exclusief agentschap. Iedereen moest een profiel kunnen aanmaken, opdrachten plaatsen of vinden, en rechtstreeks afspreken. Abonnementen (gratis / plus / premium), meertaligheid (NL/FR) en duidelijke rollen waren verplicht.",
    capabilities: [
      "Accounts per rol: model, fotograaf, visagist, kledingzaak, admin",
      "Portfolio’s, zoekertjes/opdrachten en directe communicatie",
      "Dashboards, inschrijven, inloggen en abonnementsplannen",
      "Meertalig platform (Nederlands en Frans) voor de Benelux",
      "Zoeken en filteren zodat talent en opdrachten elkaar vinden",
    ],
    tags: ["Platform", "Accounts", "NL/FR", "Abonnementen"],
    backend:
      "Beheerders houden het platform proper: wie mag erop, wat is zichtbaar, wat is betaald.",
    backendItems: [
      "Gebruikers per rol goedkeuren, blokkeren of aanpassen",
      "Zoekertjes en profielen modereren",
      "Abonnementen (gratis / plus / premium) opvolgen",
      "Meldingen, berichten en platform-instellingen (NL/FR)",
    ],
  },
  {
    title: "Class Date",
    url: "https://www.class-date.be",
    urlLabel: "class-date.be",
    sector: "Dating + app",
    result: "Publieke site én matching-app",
    summary:
      "Veilig en fris daten: wervende website plus een echte app met profielen, matches, berichten en locatie — geen kale landingspagina.",
    brief:
      "Er moest een volwaardige datingdienst komen, geen brochure. Bezoekers zien hoe het werkt, veiligheid en prijzen. Leden stappen over naar de app: ontdekken, liken, matchpercentages, berichten en date-zoekertjes. Privacy, blokkeren/rapporteren en verificatie hoorden bij de opdracht.",
    capabilities: [
      "Publieke site: hoe het werkt, veiligheid, prijzen, FAQ, verhalen",
      "App: aanmelden, profiel (categorieën), ontdekken en liken",
      "Matchen met percentage en afstand, likes en wederzijdse matches",
      "Berichten, locatie delen (beperkt tot goedgekeurde matches)",
      "Zoekertjes voor concrete dateplannen, plus abonnementen",
    ],
    tags: ["Website + app", "Matching", "Chat", "Veiligheid"],
    backend:
      "De datingdienst wordt achter de schermen bewaakt: echte mensen, veilige chats, duidelijke abos.",
    backendItems: [
      "Leden, profielen en foto’s controleren of verifiëren",
      "Rapporten, blokkades en misbruik afhandelen",
      "Matches, berichten en zoekertjes inzage",
      "Abonnementen en toegang tot Plus/Premium beheren",
    ],
  },
  {
    title: "Bakkerij De Korst",
    url: null,
    urlLabel: null,
    sector: "Horeca",
    result: "+48% online bestelaanvragen",
    summary:
      "Presentatiesite met assortiment, openingsuren en bestelformulier, ondersteund door professionele productfotografie.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Website", "Fotografie", "Teksten"],
    backend: null,
    backendItems: [] as string[],
  },
  {
    title: "Garage Meridian",
    url: null,
    urlLabel: null,
    sector: "Automotive",
    result: "Verdubbeling van afspraakaanvragen",
    summary:
      "Duidelijke dienstenstructuur, vertrouwensopbouw via reviews en een vernieuwde merkidentiteit.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Website", "Logo", "SEO"],
    backend: null,
    backendItems: [] as string[],
  },
  {
    title: "Praxis Nova",
    url: null,
    urlLabel: null,
    sector: "Zorg",
    result: "+40% online afspraken",
    summary:
      "Toegankelijke website met behandelinformatie, teamportretten en een korte introductievideo.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Website", "Video", "Fotografie"],
    backend: null,
    backendItems: [] as string[],
  },
  {
    title: "Markt & Meer",
    url: null,
    urlLabel: null,
    sector: "Retail",
    result: "Webshop live binnen 5 weken",
    summary:
      "E-commerce met productcatalogus, snelle checkout en wervende productcontent.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Webshop", "Content", "Performance"],
    backend: null,
    backendItems: [] as string[],
  },
  {
    title: "Bouwfirma Sterck",
    url: null,
    urlLabel: null,
    sector: "Bouw",
    result: "+55% projectaanvragen",
    summary:
      "Projectportfolio, offerteflow en consistente huisstijl voor online én offline gebruik.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Website", "Logo", "Portfolio"],
    backend: null,
    backendItems: [] as string[],
  },
  {
    title: "Horizon Group",
    url: null,
    urlLabel: null,
    sector: "Corporate",
    result: "Meertalig en schaalbaar platform",
    summary:
      "Corporate website met nieuws, vacatures en CMS voor het interne marketingteam.",
    brief: null,
    capabilities: [] as string[],
    tags: ["Maatwerk", "CMS", "NL/FR/EN"],
    backend: null,
    backendItems: [] as string[],
  },
] as const;

export const reviews = [
  {
    name: "Marc Peeters",
    role: "Zaakvoerder · Bakkerij De Korst",
    quote:
      "SiteButler leverde website, teksten én fotografie. Het resultaat oogt professioneel en levert meetbaar meer bestellingen op.",
    score: 5,
  },
  {
    name: "Nathalie Coppens",
    role: "Zaakvoerder · Garage Meridian",
    quote:
      "Offerte binnen één dag, ontwerp kort daarna. Zakelijke aanpak, duidelijke communicatie en een website die afspraken oplevert.",
    score: 5,
  },
  {
    name: "Sofie Janssen",
    role: "Praktijkmanager · Praxis Nova",
    quote:
      "De introductievideo op de homepage versterkt het vertrouwen. Patiënten begrijpen sneller wie we zijn en wat we doen.",
    score: 5,
  },
  {
    name: "Pieter Van Acker",
    role: "Marketingverantwoordelijke · Horizon Group",
    quote:
      "Van lokale sites tot ons corporate platform: SiteButler werkt gestructureerd, denkt mee en levert op tijd.",
    score: 5,
  },
] as const;

export const faqs = [
  {
    q: "Voor welke organisaties werken jullie?",
    a: "Voor lokale ondernemers, KMO's én grotere organisaties in uiteenlopende sectoren — van horeca en retail tot zorg, bouw en corporate.",
  },
  {
    q: "Kunnen jullie ook logo, teksten, foto en video verzorgen?",
    a: "Ja. U kunt een volledig traject laten uitvoeren, of enkel de website als u al over content beschikt.",
  },
  {
    q: "Hoe snel ontvang ik een offerte?",
    a: "Binnen 24 uur na een volledige aanvraag ontvangt u een gestructureerde offerte.",
  },
  {
    q: "Wanneer zie ik een eerste ontwerp?",
    a: "Binnen 48 uur na goedkeuring van de offerte tonen wij een eerste ontwerprichting.",
  },
  {
    q: "Hoe lever ik bestanden aan?",
    a: "Via het briefingportaal uploadt u teksten, logo's, foto's, video's en referentievoorbeelden op één centrale plek.",
  },
  {
    q: "Wat zijn de startprijzen?",
    a: "Eenvoudige website vanaf €1.250, website met backend vanaf €2.995. Volledig maatwerk op aanvraag.",
  },
] as const;
