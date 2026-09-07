export type SponsorTierId =
  | "headline"
  | "gold"
  | "silver"
  | "bronze"
  | "starter";

export type SponsorTier = {
  id: SponsorTierId;
  name: string;
  minCents: number;
  priceLabel: string;
  placement: string;
  perks: string[];
};

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "headline",
    name: "Hoofdsponsor",
    minCents: 2_500_000,
    priceLabel: "€25.000",
    placement: "De grootste plek op de site én tijdens de live trekking",
    perks: [
      "Hoofdlogo op de homepage",
      "Naam in beeld bij de live trekking van de vier weekends",
      "Eerste plaats op de sponsorpagina",
      "Vermelding in updates zolang de campagne loopt",
    ],
  },
  {
    id: "gold",
    name: "Gold sponsor",
    minCents: 1_000_000,
    priceLabel: "€10.000",
    placement: "Grote zichtbaarheid op homepage en live-avond",
    perks: [
      "Groot logo op homepage en sponsorpagina",
      "Zichtbaar in de stream van de live trekking",
      "Plek in de Gold-rij",
    ],
  },
  {
    id: "silver",
    name: "Silver sponsor",
    minCents: 250_000,
    priceLabel: "€2.500",
    placement: "Duidelijke plek op de site, zichtbaar voor alle deelnemers",
    perks: [
      "Logo op de sponsorpagina",
      "Vermelding op de homepage",
      "Zichtbaar bij de live trekking",
    ],
  },
  {
    id: "bronze",
    name: "Bronze sponsor",
    minCents: 50_000,
    priceLabel: "€500",
    placement: "Vaste plek op de sponsormuur",
    perks: ["Logo of naam op de sponsorpagina", "Meegerekend in het campagnedoel"],
  },
];

export const SPONSOR_MIN_CENTS = 50_000;

export const LOGO_FRAME: Record<SponsorTierId, { ratio: string; px: string }> = {
  headline: { ratio: "16 / 5", px: "1600 × 500 px" },
  gold: { ratio: "2 / 1", px: "1200 × 600 px" },
  silver: { ratio: "2 / 1", px: "900 × 450 px" },
  bronze: { ratio: "2 / 1", px: "800 × 400 px" },
  starter: { ratio: "2 / 1", px: "800 × 400 px" },
};

export const LOGO_RECOMMENDED_PX: Record<SponsorTierId, string> = {
  headline: LOGO_FRAME.headline.px,
  gold: LOGO_FRAME.gold.px,
  silver: LOGO_FRAME.silver.px,
  bronze: LOGO_FRAME.bronze.px,
  starter: LOGO_FRAME.starter.px,
};

export function sponsorSignupHref(tier: SponsorTierId = "gold") {
  return `/sponsor-worden?tier=${tier}`;
}

export function pixelOrderHref() {
  return "/koop-pixels";
}

export function parseSponsorTierParam(value: string | undefined | null): SponsorTierId {
  if (value === "headline" || value === "gold" || value === "silver" || value === "bronze") {
    return value;
  }
  return "gold";
}

export function tierForAmount(cents: number): SponsorTier {
  return (
    SPONSOR_TIERS.find((t) => cents >= t.minCents) ||
    SPONSOR_TIERS[SPONSOR_TIERS.length - 1]
  );
}

export const PIXEL_COLS = 80;
export const PIXEL_ROWS = 32;
export const PIXEL_CELL_CENTS = 1_000;
export const PIXEL_MAX_W = 10;
export const PIXEL_MAX_H = 6;

/** Title plate on the wall — snapped to the grid, not for sale. */
export const PIXEL_TITLE_RESERVE = { x: 28, y: 0, w: 24, h: 9 };

export type PixelSize = {
  id: string;
  w: number;
  h: number;
  cents: number;
  label: string;
};

export function pixelPriceCents(w: number, h: number) {
  const cells = Math.max(1, w * h);
  if (cells === 1) return PIXEL_CELL_CENTS;
  const euros = Math.round(cells * (PIXEL_CELL_CENTS / 100) * (cells <= 8 ? 0.9 : cells <= 15 ? 0.8667 : 0.85));
  return euros * 100;
}

export function pixelSizeId(w: number, h: number) {
  return `${w}x${h}`;
}

export function pixelSizeLabel(w: number, h: number) {
  const euros = Math.round(pixelPriceCents(w, h) / 100);
  if (w === 1 && h === 1) return `1 vak · €${euros}`;
  return `${w}×${h} vakken · €${euros}`;
}

export function makePixelSize(w: number, h: number): PixelSize {
  return {
    id: pixelSizeId(w, h),
    w,
    h,
    cents: pixelPriceCents(w, h),
    label: pixelSizeLabel(w, h),
  };
}

export const PIXEL_PACKAGES: PixelSize[] = [
  makePixelSize(1, 1),
  makePixelSize(2, 2),
  makePixelSize(4, 2),
  makePixelSize(5, 3),
];

export type PixelPackageId = string;

export function pixelPackage(id: string) {
  const fromList = PIXEL_PACKAGES.find((p) => p.id === id);
  if (fromList) return fromList;
  const match = /^(\d+)x(\d+)$/.exec(id);
  if (!match) return null;
  const w = Number(match[1]);
  const h = Number(match[2]);
  if (!validPixelSize(w, h)) return null;
  return makePixelSize(w, h);
}

export function validPixelSize(w: number, h: number) {
  return (
    Number.isInteger(w) &&
    Number.isInteger(h) &&
    w >= 1 &&
    h >= 1 &&
    w <= PIXEL_COLS &&
    h <= PIXEL_ROWS
  );
}

const PIXEL_SIZE_CANDIDATES: { w: number; h: number }[] = [
  { w: 1, h: 1 },
  { w: 2, h: 1 },
  { w: 3, h: 1 },
  { w: 4, h: 1 },
  { w: 5, h: 1 },
  { w: 1, h: 2 },
  { w: 2, h: 2 },
  { w: 3, h: 2 },
  { w: 4, h: 2 },
  { w: 5, h: 2 },
  { w: 6, h: 2 },
  { w: 8, h: 2 },
  { w: 1, h: 3 },
  { w: 2, h: 3 },
  { w: 3, h: 3 },
  { w: 4, h: 3 },
  { w: 5, h: 3 },
  { w: 6, h: 3 },
  { w: 2, h: 4 },
  { w: 3, h: 4 },
  { w: 4, h: 4 },
  { w: 1, h: 4 },
];

export type PixelSuggestion = PixelSize & {
  fit: number;
  recommended: boolean;
  spot: { x: number; y: number; w: number; h: number } | null;
};

export function suggestPixelSizes(
  aspect: number,
  occupied: OccupiedPixel[],
  limit = 4,
): PixelSuggestion[] {
  const safeAspect = aspect > 0.05 && Number.isFinite(aspect) ? aspect : 1;
  const ranked = PIXEL_SIZE_CANDIDATES.map((c) => {
    const packAspect = c.w / c.h;
    const fit = Math.min(packAspect, safeAspect) / Math.max(packAspect, safeAspect);
    const area = c.w * c.h;
    const areaPenalty = area < 2 ? 0.12 : area > 18 ? (area - 18) * 0.015 : 0;
    const spot = firstFreeRect(occupied, c.w, c.h);
    return {
      ...makePixelSize(c.w, c.h),
      fit,
      recommended: false,
      spot,
      rank: 1 - fit + areaPenalty + (spot ? 0 : 0.45),
    };
  });
  ranked.sort((a, b) => a.rank - b.rank || a.cents - b.cents);
  const picked = ranked.filter((s) => s.spot).slice(0, limit);
  const fallback = picked.length ? picked : ranked.slice(0, limit);
  return fallback.map((s, i) => ({
    id: s.id,
    w: s.w,
    h: s.h,
    cents: s.cents,
    label: s.label,
    fit: s.fit,
    recommended: i === 0,
    spot: s.spot,
  }));
}

export function bestFreeRects(
  occupied: OccupiedPixel[],
  w: number,
  h: number,
  limit = 3,
) {
  const found: { x: number; y: number; w: number; h: number }[] = [];
  for (let y = 0; y <= PIXEL_ROWS - h; y++) {
    for (let x = 0; x <= PIXEL_COLS - w; x++) {
      const candidate = { x, y, w, h };
      if (!occupied.some((o) => rectsOverlap(candidate, o)) && !pixelOverlapsTitleReserve(candidate)) {
        found.push(candidate);
        if (found.length >= limit) return found;
      }
    }
  }
  return found;
}

export type OccupiedPixel = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  caption: string | null;
  color: string;
  url: string | null;
  image: string | null;
};

function exampleMark() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect width="320" height="160" fill="#111111"/><rect x="14" y="14" width="292" height="132" fill="none" stroke="#d4ab7e" stroke-width="4"/><circle cx="64" cy="80" r="28" fill="#d4ab7e"/><path d="M52 88c8-18 16-18 24 0" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/><path d="M58 78h12M64 70v20" stroke="#111" stroke-width="3" stroke-linecap="round"/><text x="108" y="74" fill="#d4ab7e" font-family="Arial Black,Impact,sans-serif" font-size="28">DE KORREL</text><text x="108" y="104" fill="#e4ba92" font-family="Arial,sans-serif" font-size="13">BAKKERIJ</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function exampleLogo(name: string, bg: string, fg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><rect width="320" height="120" fill="${bg}"/><text x="160" y="72" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="22" fill="${fg}">${name}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pixelOverlapsTitleReserve(rect: { x: number; y: number; w: number; h: number }) {
  return rectsOverlap(rect, PIXEL_TITLE_RESERVE);
}

export function withoutTitleReserveAds(pixels: OccupiedPixel[]) {
  return pixels.filter((p) => !pixelOverlapsTitleReserve(p));
}

export function fitsOnGrid(x: number, y: number, w: number, h: number) {
  return x >= 0 && y >= 0 && x + w <= PIXEL_COLS && y + h <= PIXEL_ROWS;
}

export function firstFreeRect(
  occupied: OccupiedPixel[],
  w: number,
  h: number,
  fromX = 0,
  fromY = 0,
) {
  for (let y = fromY; y <= PIXEL_ROWS - h; y++) {
    const xStart = y === fromY ? fromX : 0;
    for (let x = xStart; x <= PIXEL_COLS - w; x++) {
      const candidate = { x, y, w, h };
      if (!occupied.some((o) => rectsOverlap(candidate, o)) && !pixelOverlapsTitleReserve(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

export const EXAMPLE_SPONSORS: {
  name: string;
  url: string;
  tier: SponsorTierId;
  cents: number;
  tagline: string;
}[] = [
  {
    name: "Noordlicht Logistics",
    url: "https://example.com",
    tier: "headline",
    cents: 2_500_000,
    tagline: "Hoofdpartner van de live trekking",
  },
  {
    name: "Atelier Vanhecke",
    url: "https://example.com",
    tier: "gold",
    cents: 1_000_000,
    tagline: "Goud — grote plek onder de teller",
  },
  {
    name: "Horizon Print",
    url: "https://example.com",
    tier: "gold",
    cents: 1_000_000,
    tagline: "Goud — grote plek onder de teller",
  },
  {
    name: "Café De Overkant",
    url: "https://example.com",
    tier: "silver",
    cents: 250_000,
    tagline: "Zilver — midden op de homepage",
  },
  {
    name: "Brasserie Kwartier",
    url: "https://example.com",
    tier: "silver",
    cents: 250_000,
    tagline: "Zilver — midden op de homepage",
  },
  {
    name: "Studio Kade",
    url: "https://example.com",
    tier: "bronze",
    cents: 50_000,
    tagline: "Brons — compacte rij",
  },
  {
    name: "Houthandel Polder",
    url: "https://example.com",
    tier: "bronze",
    cents: 50_000,
    tagline: "Brons — compacte rij",
  },
  {
    name: "Taxi Westland",
    url: "https://example.com",
    tier: "bronze",
    cents: 50_000,
    tagline: "Brons — compacte rij",
  },
  {
    name: "Poetsbedrijf Helder",
    url: "https://example.com",
    tier: "bronze",
    cents: 50_000,
    tagline: "Brons — compacte rij",
  },
];

export const EXAMPLE_SPONSOR_NAMES = EXAMPLE_SPONSORS.map((s) => s.name);

export function isExampleSponsor(name: string | null | undefined) {
  if (!name) return false;
  return EXAMPLE_SPONSOR_NAMES.includes(name);
}

export type SponsorCardData = {
  name: string;
  url: string | null;
  tier: SponsorTierId | string;
  cents: number;
  tagline?: string;
  logo?: string | null;
};

export function exampleSponsorCards(): SponsorCardData[] {
  return EXAMPLE_SPONSORS.map((s) => ({
    name: s.name,
    url: s.url,
    tier: s.tier,
    cents: s.cents,
    tagline: s.tagline,
  }));
}

export function groupSponsors(sponsors: SponsorCardData[]) {
  const groups: Record<SponsorTierId, SponsorCardData[]> = {
    headline: [],
    gold: [],
    silver: [],
    bronze: [],
    starter: [],
  };
  for (const s of sponsors) {
    const raw = s.tier as SponsorTierId;
    const key: SponsorTierId =
      raw === "headline" || raw === "gold" || raw === "silver" || raw === "bronze"
        ? raw
        : "bronze";
    groups[key].push(s);
  }
  return groups;
}

export const EXAMPLE_PIXELS: OccupiedPixel[] = [
  {
    x: 0,
    y: 0,
    w: 5,
    h: 3,
    label: "Bakkerij De Korrel",
    caption: "Ambachtelijk brood",
    color: "#111111",
    url: "https://example.com",
    image: exampleMark(),
  },
  {
    x: 5,
    y: 0,
    w: 4,
    h: 2,
    label: "Garage Westpoort",
    caption: "Onderhoud & banden",
    color: "#1a1400",
    url: "https://example.com",
    image: exampleLogo("WESTPOORT", "#1a1400", "#e4ba92"),
  },
  {
    x: 9,
    y: 0,
    w: 2,
    h: 2,
    label: "Kapper Luna",
    caption: "Knippen & kleur",
    color: "#1c1610",
    url: "https://example.com",
    image: exampleLogo("LUNA", "#1c1610", "#d4ab7e"),
  },
  {
    x: 11,
    y: 0,
    w: 1,
    h: 1,
    label: "Frituur Max",
    caption: null,
    color: "#d4ab7e",
    url: "https://example.com",
    image: null,
  },
  {
    x: 12,
    y: 0,
    w: 2,
    h: 2,
    label: "Bloemen Saar",
    caption: "Boeketten",
    color: "#17120c",
    url: "https://example.com",
    image: exampleLogo("SAAR", "#17120c", "#d4ab7e"),
  },
  {
    x: 14,
    y: 0,
    w: 4,
    h: 2,
    label: "Drukkerij Kade",
    caption: "Drukwerk op maat",
    color: "#0f0f0f",
    url: "https://example.com",
    image: exampleLogo("KADE", "#0f0f0f", "#d4ab7e"),
  },
];
