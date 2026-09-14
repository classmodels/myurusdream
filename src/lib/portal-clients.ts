import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import type { PortalState } from "@/lib/portal";
import { listExtraPreviews, listTestSlots } from "@/lib/previews";
import { hostedPathForSlug } from "@/lib/hosted-sites";

export type AdminMessage = {
  id: string;
  text: string;
  createdAt: string;
  from: "admin";
  read: boolean;
};

export type ClientRecord = {
  email: string;
  slug: string;
  title: string;
  liveSiteSlug: string;
  liveSitePath: string;
  lastLoginAt: string | null;
  updatedAt: string;
  /** Laatste keer dat admin dit dossier opende */
  lastAdminViewAt: string | null;
  /** Laatste sync/activiteit van de klant */
  clientActivityAt: string | null;
  adminMessages: AdminMessage[];
  portal: Partial<PortalState> | null;
};

export type AdminClientCard = {
  email: string;
  slug: string;
  title: string;
  liveSiteSlug: string;
  liveSitePath: string;
  lastLoginAt: string | null;
  updatedAt: string;
  hasPassword: boolean;
  published: boolean;
  messageCount: number;
  unreadForClient: number;
  changeRequests: number;
  openChangeRequests: number;
  files: number;
  comments: number;
  hasNewActivity: boolean;
};

const dir = () => path.join(process.cwd(), "data", "portal-clients");

function fileForEmail(email: string) {
  const safe = email.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "_");
  return path.join(dir(), `${safe}.json`);
}

function normalizeRecord(raw: Partial<ClientRecord> & { email: string }): ClientRecord {
  return {
    email: raw.email.trim().toLowerCase(),
    slug: raw.slug || raw.email,
    title: raw.title || raw.email,
    liveSiteSlug: raw.liveSiteSlug || "",
    liveSitePath: raw.liveSitePath || "",
    lastLoginAt: raw.lastLoginAt ?? null,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    lastAdminViewAt: raw.lastAdminViewAt ?? null,
    clientActivityAt: raw.clientActivityAt ?? null,
    adminMessages: raw.adminMessages || [],
    portal: raw.portal ?? null,
  };
}

export async function readClientRecord(email: string): Promise<ClientRecord | null> {
  try {
    const raw = await readFile(fileForEmail(email), "utf8");
    return normalizeRecord(JSON.parse(raw) as ClientRecord);
  } catch {
    return null;
  }
}

export async function writeClientRecord(record: ClientRecord) {
  await mkdir(dir(), { recursive: true });
  await writeFile(fileForEmail(record.email), JSON.stringify(normalizeRecord(record), null, 2), "utf8");
}

export async function listClientRecords(): Promise<ClientRecord[]> {
  try {
    await mkdir(dir(), { recursive: true });
    const files = await readdir(dir());
    const rows: ClientRecord[] = [];
    for (const name of files) {
      if (!name.endsWith(".json")) continue;
      try {
        const raw = await readFile(path.join(dir(), name), "utf8");
        rows.push(normalizeRecord(JSON.parse(raw) as ClientRecord));
      } catch {
        /* skip */
      }
    }
    return rows.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch {
    return [];
  }
}

function activityFlag(rec: ClientRecord | undefined) {
  if (!rec) return false;
  const open = rec.portal?.changeRequests?.filter((r) => r.status === "open").length || 0;
  if (open > 0) return true;
  if (!rec.clientActivityAt) return false;
  if (!rec.lastAdminViewAt) return Boolean(rec.portal);
  return rec.clientActivityAt > rec.lastAdminViewAt;
}

/** Catalogusklanten + eventuele activity-records samenvoegen */
export async function listAdminClients(): Promise<AdminClientCard[]> {
  const slots = await listTestSlots();
  const extras = await listExtraPreviews();
  const catalog = [...slots, ...extras].filter((p) => p.portalEmail);
  const records = await listClientRecords();
  const byEmail = new Map(records.map((r) => [r.email.toLowerCase(), r]));

  const fromCatalog = catalog.map((p) => {
    const email = (p.portalEmail || "").toLowerCase();
    const rec = byEmail.get(email);
    byEmail.delete(email);
    const liveSiteSlug = p.liveSiteSlug || "";
    return {
      email,
      slug: p.slug,
      title: p.title || p.clientLabel || email,
      liveSiteSlug,
      liveSitePath: liveSiteSlug ? hostedPathForSlug(liveSiteSlug) : "",
      lastLoginAt: rec?.lastLoginAt || null,
      updatedAt: rec?.updatedAt || "",
      hasPassword: Boolean(p.portalPassword),
      published: p.published === true,
      messageCount: rec?.adminMessages?.length || 0,
      unreadForClient: rec?.adminMessages?.filter((m) => !m.read).length || 0,
      changeRequests: rec?.portal?.changeRequests?.length || 0,
      openChangeRequests: rec?.portal?.changeRequests?.filter((r) => r.status === "open").length || 0,
      files: rec?.portal?.files?.length || 0,
      comments: rec?.portal?.comments?.length || 0,
      hasNewActivity: activityFlag(rec),
    };
  });

  const orphans = [...byEmail.values()].map((rec) => ({
    email: rec.email,
    slug: rec.slug,
    title: rec.title,
    liveSiteSlug: rec.liveSiteSlug,
    liveSitePath: rec.liveSitePath || (rec.liveSiteSlug ? hostedPathForSlug(rec.liveSiteSlug) : ""),
    lastLoginAt: rec.lastLoginAt,
    updatedAt: rec.updatedAt,
    hasPassword: true,
    published: true,
    messageCount: rec.adminMessages?.length || 0,
    unreadForClient: rec.adminMessages?.filter((m) => !m.read).length || 0,
    changeRequests: rec.portal?.changeRequests?.length || 0,
    openChangeRequests: rec.portal?.changeRequests?.filter((r) => r.status === "open").length || 0,
    files: rec.portal?.files?.length || 0,
    comments: rec.portal?.comments?.length || 0,
    hasNewActivity: activityFlag(rec),
  }));

  return [...fromCatalog, ...orphans];
}
