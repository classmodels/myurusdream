import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  TEST_SLOT_COUNT,
  makeEmptySlot,
  previewProjects,
  slotNumberFromSlug,
  slotSlug,
  type PreviewProject,
} from "@/lib/preview-model";

export * from "@/lib/preview-model";

/** Duurzame plek (niet in gitignored public/uploads — dat verdween bij elke Combell-pipeline). */
const durableCatalogFile = () =>
  path.join(process.cwd(), "data", "portal-catalog.json");

/** Oude locatie — nog lezen voor migratie. */
const legacyCatalogFile = () =>
  path.join(process.cwd(), "public", "uploads", "previews", "catalog.json");

async function readJsonFile(file: string): Promise<PreviewProject[] | null> {
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as PreviewProject[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function readCatalog(): Promise<PreviewProject[]> {
  const durable = await readJsonFile(durableCatalogFile());
  if (durable && durable.length) return durable;

  const legacy = await readJsonFile(legacyCatalogFile());
  if (legacy && legacy.length) {
    // Eenmalig migreren zodat volgende deploys/restarts de data behouden in data/
    await writeCatalog(legacy);
    return legacy;
  }

  return durable || [];
}

export async function writeCatalog(items: PreviewProject[]) {
  const file = durableCatalogFile();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(items, null, 2), "utf8");
}

export async function listAllPreviews(): Promise<PreviewProject[]> {
  const extra = await readCatalog();
  const map = new Map<string, PreviewProject>();
  for (const p of previewProjects) map.set(p.slug, p);
  for (const p of extra) map.set(p.slug, p);
  return [...map.values()];
}

export async function listTestSlots(): Promise<PreviewProject[]> {
  const all = await listAllPreviews();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return Array.from({ length: TEST_SLOT_COUNT }, (_, i) => {
    const n = i + 1;
    const existing = bySlug.get(slotSlug(n));
    return existing ? { ...makeEmptySlot(n), ...existing, slot: n, slug: slotSlug(n) } : makeEmptySlot(n);
  });
}

export async function listExtraPreviews(): Promise<PreviewProject[]> {
  const all = await listAllPreviews();
  return all.filter((p) => slotNumberFromSlug(p.slug) == null);
}

export async function getPreviewProject(slug: string) {
  const slot = slotNumberFromSlug(slug);
  if (slot) {
    const slots = await listTestSlots();
    return slots.find((p) => p.slot === slot);
  }
  const all = await listAllPreviews();
  const byPublic = all.find((p) => (p.publicSlug || "") === slug);
  if (byPublic) return byPublic;
  return all.find((p) => p.slug === slug);
}

export async function getPreviewByPublicSlug(publicSlug: string) {
  const needle = publicSlug.trim().toLowerCase();
  if (!needle) return undefined;
  const slots = await listTestSlots();
  const extras = await listExtraPreviews();
  return [...slots, ...extras].find(
    (p) => (p.publicSlug || "").toLowerCase() === needle || p.slug === needle,
  );
}
