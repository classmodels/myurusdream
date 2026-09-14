import { NextResponse } from "next/server";
import {
  PREVIEW_MANAGE_CODE,
  makeEmptySlot,
  randomAccessCode,
  slotNumberFromSlug,
  type PreviewProject,
} from "@/lib/preview-model";
import {
  listAdminClients,
  readClientRecord,
  writeClientRecord,
  type AdminMessage,
} from "@/lib/portal-clients";
import { listExtraPreviews, listTestSlots, readCatalog, writeCatalog } from "@/lib/previews";
import { listHostedSites, hostedPathForSlug } from "@/lib/hosted-sites";

export const runtime = "nodejs";

async function ensureLinkedClient(input: {
  email: string;
  password: string;
  liveSiteSlug: string;
  title?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  const liveSiteSlug = input.liveSiteSlug.trim().toLowerCase();
  const hosted = listHostedSites().find((s) => s.slug === liveSiteSlug);
  if (!email || !password || !hosted) {
    throw new Error("E-mail, wachtwoord en geldige site zijn verplicht.");
  }

  const slots = await listTestSlots();
  const extras = await listExtraPreviews();
  const current = [...slots, ...extras].find((p) => p.portalEmail === email);
  const free = slots.find((p) => !p.portalEmail);
  const base: PreviewProject = current || free || makeEmptySlot(1);
  const catalog = await readCatalog();
  const slug = base.slug;
  const next: PreviewProject = {
    ...base,
    slug,
    slot: base.slot || slotNumberFromSlug(slug) || undefined,
    title: input.title?.trim() || hosted.slug,
    clientLabel: email,
    portalEmail: email,
    portalPassword: password || base.portalPassword || "",
    liveSiteSlug,
    published: true,
    accessCode: base.accessCode || randomAccessCode(base.slot || 1),
    summary: base.summary || "Website in ontwikkeling bij SiteButler.",
    progress: base.progress || 10,
    previewUrl: base.previewUrl || "",
    changelog: base.changelog?.length ? base.changelog : [{ date: "Nu", text: "Klantaccount aangemaakt." }],
    accent: base.accent || "#2563eb",
    accent2: base.accent2 || "#0f766e",
    tagline: base.tagline || "",
    heroText: base.heroText || "",
    about: base.about || "",
    services: base.services || "",
    contact: base.contact || "",
    logoUrl: base.logoUrl || "",
    pages: base.pages || [],
    publicSlug: base.publicSlug || hosted.slug,
  };
  await writeCatalog([...catalog.filter((p) => p.slug !== slug), next]);

  const existing = (await readClientRecord(email)) || {
    email,
    slug,
    title: next.title,
    liveSiteSlug,
    liveSitePath: hostedPathForSlug(liveSiteSlug),
    lastLoginAt: null,
    updatedAt: new Date().toISOString(),
    adminMessages: [] as AdminMessage[],
    portal: null,
  };
  await writeClientRecord({
    ...existing,
    slug,
    title: next.title,
    liveSiteSlug,
    liveSitePath: hostedPathForSlug(liveSiteSlug),
    updatedAt: new Date().toISOString(),
  });
  return next;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      manageCode?: string;
      action?: string;
      email?: string;
      password?: string;
      liveSiteSlug?: string;
      title?: string;
      message?: string;
    };

    if (String(body.manageCode || "") !== PREVIEW_MANAGE_CODE) {
      return NextResponse.json({ error: "Onjuiste beheercode." }, { status: 401 });
    }

    const action = body.action || "list";

    if (action === "unlock" || action === "list") {
      return NextResponse.json({
        ok: true,
        clients: await listAdminClients(),
        sites: listHostedSites().map((s) => ({ slug: s.slug, basePath: s.basePath })),
      });
    }

    if (action === "create-client") {
      const project = await ensureLinkedClient({
        email: String(body.email || ""),
        password: String(body.password || ""),
        liveSiteSlug: String(body.liveSiteSlug || ""),
        title: body.title,
      });
      return NextResponse.json({
        ok: true,
        project,
        clients: await listAdminClients(),
        sites: listHostedSites().map((s) => ({ slug: s.slug, basePath: s.basePath })),
      });
    }

    if (action === "get-client") {
      const email = String(body.email || "").trim().toLowerCase();
      const record = await readClientRecord(email);
      const slots = await listTestSlots();
      const extras = await listExtraPreviews();
      const catalog = [...slots, ...extras].find((p) => p.portalEmail === email);
      return NextResponse.json({
        ok: true,
        record,
        catalog: catalog
          ? {
              slug: catalog.slug,
              title: catalog.title,
              liveSiteSlug: catalog.liveSiteSlug,
              portalEmail: catalog.portalEmail,
              published: catalog.published,
            }
          : null,
        liveSitePath: catalog?.liveSiteSlug
          ? hostedPathForSlug(catalog.liveSiteSlug)
          : record?.liveSitePath || "",
      });
    }

    if (action === "send-message") {
      const email = String(body.email || "").trim().toLowerCase();
      const text = String(body.message || "").trim();
      if (!email || !text) {
        return NextResponse.json({ error: "E-mail en boodschap zijn verplicht." }, { status: 400 });
      }
      const slots = await listTestSlots();
      const extras = await listExtraPreviews();
      const catalog = [...slots, ...extras].find((p) => p.portalEmail === email);
      const existing = (await readClientRecord(email)) || {
        email,
        slug: catalog?.slug || email,
        title: catalog?.title || email,
        liveSiteSlug: catalog?.liveSiteSlug || "",
        liveSitePath: catalog?.liveSiteSlug ? hostedPathForSlug(catalog.liveSiteSlug) : "",
        lastLoginAt: null,
        updatedAt: new Date().toISOString(),
        adminMessages: [] as AdminMessage[],
        portal: null,
      };
      const msg: AdminMessage = {
        id: `m-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        from: "admin",
        read: false,
      };
      existing.adminMessages = [msg, ...(existing.adminMessages || [])];
      existing.updatedAt = new Date().toISOString();
      await writeClientRecord(existing);
      return NextResponse.json({ ok: true, record: existing });
    }

    return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mislukt." },
      { status: 500 },
    );
  }
}
