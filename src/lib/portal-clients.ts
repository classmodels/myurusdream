import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import type { PortalState } from "@/lib/portal";
import { listExtraPreviews, listTestSlots } from "@/lib/previews";

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
  adminMessages: AdminMessage[];
  /** Snapshot van klantportaal (lokaal gesynct) */
  portal: Partial<PortalState> | null;
};

const dir = () => path.join(process.cwd(), "data", "portal-clients");

function fileForEmail(email: string) {
  const safe = email.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "_");
  return path.join(dir(), `${safe}.json`);
}

export async function readClientRecord(email: string): Promise<ClientRecord | null> {
  try {
    const raw = await readFile(fileForEmail(email), "utf8");
    return JSON.parse(raw) as ClientRecord;
  } catch {
    return null;
  }
}

export async function writeClientRecord(record: ClientRecord) {
  await mkdir(dir(), { recursive: true });
  await writeFile(fileForEmail(record.email), JSON.stringify(record, null, 2), "utf8");
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
        rows.push(JSON.parse(raw) as ClientRecord);
      } catch {
        /* skip */
      }
    }
    return rows.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  } catch {
    return [];
  }
}

/** Catalogusklanten + eventuele activity-records samenvoegen */
export async function listAdminClients() {
  const slots = await listTestSlots();
  const extras = await listExtraPreviews();
  const catalog = [...slots, ...extras].filter((p) => p.portalEmail);
  const records = await listClientRecords();
  const byEmail = new Map(records.map((r) => [r.email.toLowerCase(), r]));

  const fromCatalog = catalog.map((p) => {
    const email = (p.portalEmail || "").toLowerCase();
    const rec = byEmail.get(email);
    byEmail.delete(email);
    return {
      email,
      slug: p.slug,
      title: p.title || p.clientLabel || email,
      liveSiteSlug: p.liveSiteSlug || "",
      liveSitePath: p.liveSiteSlug ? `/portaal/${p.liveSiteSlug}` : "",
      lastLoginAt: rec?.lastLoginAt || null,
      updatedAt: rec?.updatedAt || "",
      hasPassword: Boolean(p.portalPassword),
      published: p.published === true,
      messageCount: rec?.adminMessages?.length || 0,
      unreadForClient: rec?.adminMessages?.filter((m) => !m.read).length || 0,
      changeRequests: rec?.portal?.changeRequests?.length || 0,
      files: rec?.portal?.files?.length || 0,
      comments: rec?.portal?.comments?.length || 0,
    };
  });

  const orphans = [...byEmail.values()].map((rec) => ({
    email: rec.email,
    slug: rec.slug,
    title: rec.title,
    liveSiteSlug: rec.liveSiteSlug,
    liveSitePath: rec.liveSitePath,
    lastLoginAt: rec.lastLoginAt,
    updatedAt: rec.updatedAt,
    hasPassword: true,
    published: true,
    messageCount: rec.adminMessages?.length || 0,
    unreadForClient: rec.adminMessages?.filter((m) => !m.read).length || 0,
    changeRequests: rec.portal?.changeRequests?.length || 0,
    files: rec.portal?.files?.length || 0,
    comments: rec.portal?.comments?.length || 0,
  }));

  return [...fromCatalog, ...orphans];
}
