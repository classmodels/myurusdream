export const SITE_NAME = "DroomOp2";
export const SITE_DOMAIN = "droomop2.be";
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
