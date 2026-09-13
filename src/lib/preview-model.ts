export const TEST_SLOT_COUNT = 10;

export type PreviewPage = {
  title: string;
  imageUrl: string;
};

export type PreviewProject = {
  slug: string;
  title: string;
  clientLabel: string;
  summary: string;
  progress: number;
  accessCode: string;
  previewUrl: string;
  changelog: { date: string; text: string }[];
  slot?: number;
  published?: boolean;
  accent?: string;
  accent2?: string;
  tagline?: string;
  heroText?: string;
  about?: string;
  services?: string;
  contact?: string;
  logoUrl?: string;
  pages?: PreviewPage[];
  /** Zichtbaar als sitebutler.be/s/dit-stuk */
  publicSlug?: string;
  portalEmail?: string;
  portalPassword?: string;
  /** Live Next-site onder /portaal/… die deze klant mag zien */
  liveSiteSlug?: string;
};

export const PREVIEW_MANAGE_CODE = "butler2026";

export function slotSlug(n: number) {
  return `testsite-${n}`;
}

export function slotNumberFromSlug(slug: string) {
  const m = /^testsite-(\d+)$/.exec(slug);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 1 || n > TEST_SLOT_COUNT) return null;
  return n;
}

export function makeEmptySlot(n: number): PreviewProject {
  return {
    slug: slotSlug(n),
    slot: n,
    title: `Testsite ${n}`,
    clientLabel: "Nog niet ingesteld",
    summary: "",
    progress: 10,
    accessCode: "",
    previewUrl: "",
    changelog: [],
    published: false,
    accent: "#2563eb",
    accent2: "#0f766e",
    tagline: "",
    heroText: "",
    about: "",
    services: "",
    contact: "",
    logoUrl: "",
    pages: [],
    publicSlug: "",
    portalEmail: "",
    portalPassword: "",
    liveSiteSlug: "",
  };
}

export function isPublicPreview(url: string) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1" && host !== "::1";
  } catch {
    return false;
  }
}

export function hasMockSite(p: Pick<PreviewProject, "pages" | "logoUrl" | "tagline" | "heroText" | "about" | "services">) {
  return Boolean(
    (p.pages && p.pages.length) ||
      p.logoUrl ||
      p.tagline?.trim() ||
      p.heroText?.trim() ||
      p.about?.trim() ||
      p.services?.trim(),
  );
}

export function isClientVisible(p: PreviewProject) {
  if (p.slot) return p.published === true;
  return p.published !== false;
}

export const previewProjects: PreviewProject[] = [
  {
    slug: "myurusdream",
    title: "Myurusdream",
    clientLabel: "Campagne-site in opbouw",
    summary:
      "Interactieve inzamelingssite met live teller, pixelwall en sponsorblokken. Draait nog op de ontwikkelcomputer — hier volgt u de voortgang en geeft u feedback.",
    progress: 70,
    accessCode: "urus2026",
    previewUrl: "",
    published: true,
    changelog: [
      { date: "Sept 2026", text: "Homepage, teller, hoofdsponsor en pixelwall opgezet" },
      { date: "Sept 2026", text: "Betalingen en deelnemersoverzicht in uitwerking" },
      { date: "Nu", text: "Nog niet live — preview volgt zodra er een publieke testdomein-link is" },
    ],
  },
];

export const RESERVED_PUBLIC_SLUGS = new Set([
  "s",
  "test",
  "voortgang",
  "portaal",
  "diensten",
  "prijzen",
  "portfolio",
  "contact",
  "over-ons",
  "werkwijze",
  "offerte",
  "briefing",
  "api",
  "login",
  "admin",
  "beheer",
]);

export function previewPublic(p: PreviewProject) {
  const { accessCode: _code, portalPassword: _pw, ...rest } = p;
  return rest;
}

export function slugifyPreview(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "project"
  );
}

export function randomAccessCode(slot: number) {
  const token = Math.random().toString(36).slice(2, 8);
  return `klant${slot}-${token}`;
}

export type PreviewPublic = ReturnType<typeof previewPublic>;

export type PreviewFeedback = {
  id: string;
  naam: string;
  score: number;
  comment: string;
  createdAt: string;
};

export type PreviewCard = {
  slug: string;
  title: string;
  clientLabel: string;
  summary: string;
  progress: number;
  publicSlug?: string;
};
