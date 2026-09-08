export const SITE_DOMAIN = "myurusdream.be";
export const SITE_NAME = SITE_DOMAIN;
export const CAMPAIGN_SLUG = "myurusdream";
export const TAGLINE = "Kan €2 een droom op wielen waarmaken?";

export const LEGAL_WATERMARK =
  "[JURIDISCHE CONTROLE VEREIST VOOR PUBLICATIE]";

export const NOT_CHARITY_LINES = [
  "DIT IS GEEN GOED DOEL.",
  "DIT IS GEEN INVESTERING.",
  "DIT IS GEEN BELOFTE OP WINST.",
  "DIT IS EEN OPEN EN TRANSPARANTE PERSOONLIJKE CAMPAGNE.",
] as const;

export const LAMBORGHINI_DISCLAIMER =
  "Deze onafhankelijke campagne is niet verbonden aan, georganiseerd door of gesponsord door Automobili Lamborghini S.p.A.";

export const SHARE_TEXT =
  "Ik heb €2 bijgedragen aan misschien wel de gekste eerlijke autocampagne van België. Kijken of 200.000 mensen samen één Lamborghini Urus mogelijk kunnen maken.";

export const DEFAULT_CHECKLIST = {
  organizerIdentified: false,
  privacyApproved: false,
  termsApproved: false,
  goalFailureSet: false,
  taxReviewed: false,
  pspActivated: false,
  insuranceReviewed: false,
  prizeLegalApproved: false,
  referralLegalApproved: false,
  ipRightsReviewed: false,
} as const;

export type ChecklistKey = keyof typeof DEFAULT_CHECKLIST;

export const CHECKLIST_LABELS: Record<ChecklistKey, string> = {
  organizerIdentified: "Organisator geïdentificeerd",
  privacyApproved: "Privacybeleid goedgekeurd",
  termsApproved: "Campagnevoorwaarden goedgekeurd",
  goalFailureSet: "Regeling bij niet behalen doel vastgelegd",
  taxReviewed: "Fiscaal nagekeken",
  pspActivated: "Betalingsprovider geactiveerd",
  insuranceReviewed: "Verzekering nagekeken",
  prizeLegalApproved: "Eventuele winactie juridisch goedgekeurd",
  referralLegalApproved: "Referralmechanisme juridisch goedgekeurd",
  ipRightsReviewed: "Merkrechten/beeldrechten nagekeken",
};

export const GOAL_FAILURE_OPTIONS = {
  A: "Bijdragen worden terugbetaald (minus eventuele transactiekosten die de betaalprovider niet restituert).",
  B: "De campagne wordt verlengd tot een nieuwe, vooraf gecommuniceerde einddatum.",
  C: "Een duidelijk vooraf omschreven alternatief, zoals gepubliceerd in de campagnevoorwaarden.",
} as const;

export type GoalFailureScenario = keyof typeof GOAL_FAILURE_OPTIONS;

export const LEGAL_DOC_VERSION = "0.1-draft";

export const LIVE_DRAW = {
  dateLabel: "zaterdag 31 oktober 2026",
  place:
    "een spectaculaire, nog bekend te maken locatie in België — live gestreamd voor iedereen die meedeed",
  winners: 4,
} as const;

/** Product rules. Own donation always 5. Direct sharer +2. Deeper upline +1. Invitee never gets extra. */
export const POINTS = {
  own: 5,
  directSharer: 2,
  furtherLine: 1,
} as const;

/** Sharing grows the campaign — not a prize mechanism. */
export const POINTS_EXPLAIN_SHORT =
  "Deel de campagne zodat meer mensen de droom kunnen helpen. Delen is geen prijsmechanisme: het helpt alleen het verhaal en het doel van €400.000 groeien.";

/** Clear legal framing: no contest/prize linked to the €2 contribution. */
export const WINNERS_EXPLAIN =
  "Uw €2 is een vrijwillige bijdrage om het doel van €400.000 te helpen bereiken. Er is geen contest, geen loterij, geen prijs en geen kans om iets te winnen gekoppeld aan deze bijdrage. U krijgt niets in ruil — behalve oprechte dankbaarheid.";

export const SHARE_EXPLAIN_SHORT = POINTS_EXPLAIN_SHORT;
export const NO_PRIZE_EXPLAIN = WINNERS_EXPLAIN;