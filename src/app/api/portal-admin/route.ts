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
  type ClientRecord,
} from "@/lib/portal-clients";
import { listExtraPreviews, listTestSlots, readCatalog, writeCatalog } from "@/lib/previews";
import { listHostedSites, hostedPathForSlug } from "@/lib/hosted-sites";

export const runtime = "nodejs";

async function findByEmail(email: string) {
  const slots = await listTestSlots();
  const extras = await listExtraPreviews();
  return [...slots, ...extras].find((p) => p.portalEmail === email) || null;
}

async function upsertCatalogProject(next: PreviewProject) {
  const catalog = await readCatalog();
  await writeCatalog([...catalog.filter((p) => p.slug !== next.slug), next]);
}

async function ensureClientAccount(input: {
  email: string;
  password: string;
  liveSiteSlug?: string;
  title?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  if (!email || !password) {
    throw new Error("E-mail en wachtwoord zijn verplicht.");
  }
  if (password.length < 4) {
    throw new Error("Wachtwoord moet minstens 4 tekens zijn.");
  }

  const liveSiteSlug = String(input.liveSiteSlug || "")
    .trim()
    .toLowerCase();
  if (liveSiteSlug) {
    const hosted = listHostedSites().find((s) => s.slug === liveSiteSlug);
    if (!hosted) throw new Error("Onbekende site. Kies een geldige gekoppelde site.");
  }

  const slots = await listTestSlots();
  const current = await findByEmail(email);
  const free = slots.find((p) => !p.portalEmail);
  const base: PreviewProject =
    current ||
    free ||
    ({
      ...makeEmptySlot(1),
      slug: `client-${email.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || Date.now()}`,
      slot: undefined,
    } as PreviewProject);

  const title = input.title?.trim() || current?.title || liveSiteSlug || email;
  const next: PreviewProject = {
    ...base,
    slug: base.slug,
    slot: base.slot || slotNumberFromSlug(base.slug) || undefined,
    title,
    clientLabel: email,
    portalEmail: email,
    portalPassword: password,
    liveSiteSlug: liveSiteSlug || "",
    published: true,
    accessCode: base.accessCode || randomAccessCode(base.slot || Math.floor(Math.random() * 90) + 10),
    summary: base.summary || "Website in ontwikkeling bij SiteButler.",
    progress: base.progress || 10,
    previewUrl: base.previewUrl || "",
    changelog: base.changelog?.length
      ? base.changelog
      : [{ date: "Nu", text: "Klantaccount aangemaakt." }],
    accent: base.accent || "#2563eb",
    accent2: base.accent2 || "#0f766e",
    tagline: base.tagline || "",
    heroText: base.heroText || "",
    about: base.about || "",
    services: base.services || "",
    contact: base.contact || "",
    logoUrl: base.logoUrl || "",
    pages: base.pages || [],
    publicSlug: base.publicSlug || liveSiteSlug || base.slug,
  };
  await upsertCatalogProject(next);

  const existing = (await readClientRecord(email)) || {
    email,
    slug: next.slug,
    title: next.title,
    liveSiteSlug: next.liveSiteSlug || "",
    liveSitePath: next.liveSiteSlug ? hostedPathForSlug(next.liveSiteSlug) : "",
    lastLoginAt: null,
    updatedAt: new Date().toISOString(),
    lastAdminViewAt: null,
    clientActivityAt: null,
    adminMessages: [] as AdminMessage[],
    portal: null,
  };
  await writeClientRecord({
    ...existing,
    slug: next.slug,
    title: next.title,
    liveSiteSlug: next.liveSiteSlug || "",
    liveSitePath: next.liveSiteSlug ? hostedPathForSlug(next.liveSiteSlug) : "",
    updatedAt: new Date().toISOString(),
  });
  return next;
}

async function patchClient(
  emailRaw: string,
  patch: {
    title?: string;
    password?: string;
    liveSiteSlug?: string | null;
  },
) {
  const email = emailRaw.trim().toLowerCase();
  const project = await findByEmail(email);
  if (!project) throw new Error("Klantaccount niet gevonden in de catalogus.");

  let liveSiteSlug = project.liveSiteSlug || "";
  if (patch.liveSiteSlug === null || patch.liveSiteSlug === "") {
    liveSiteSlug = "";
  } else if (typeof patch.liveSiteSlug === "string") {
    const slug = patch.liveSiteSlug.trim().toLowerCase();
    if (slug) {
      const hosted = listHostedSites().find((s) => s.slug === slug);
      if (!hosted) throw new Error("Onbekende site.");
      liveSiteSlug = slug;
    }
  }

  const password =
    typeof patch.password === "string" && patch.password.trim()
      ? patch.password.trim()
      : project.portalPassword || "";
  if (!password) throw new Error("Wachtwoord ontbreekt.");

  const next: PreviewProject = {
    ...project,
    title: patch.title?.trim() || project.title,
    portalPassword: password,
    liveSiteSlug,
    published: true,
    publicSlug: project.publicSlug || liveSiteSlug || project.slug,
  };
  await upsertCatalogProject(next);

  const existing = (await readClientRecord(email)) || {
    email,
    slug: next.slug,
    title: next.title,
    liveSiteSlug,
    liveSitePath: liveSiteSlug ? hostedPathForSlug(liveSiteSlug) : "",
    lastLoginAt: null,
    updatedAt: new Date().toISOString(),
    lastAdminViewAt: null,
    clientActivityAt: null,
    adminMessages: [] as AdminMessage[],
    portal: null,
  };
  await writeClientRecord({
    ...existing,
    slug: next.slug,
    title: next.title,
    liveSiteSlug,
    liveSitePath: liveSiteSlug ? hostedPathForSlug(liveSiteSlug) : "",
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
      liveSiteSlug?: string | null;
      title?: string;
      message?: string;
    };

    if (String(body.manageCode || "") !== PREVIEW_MANAGE_CODE) {
      return NextResponse.json({ error: "Onjuiste beheercode." }, { status: 401 });
    }

    const action = body.action || "list";
    const sites = listHostedSites().map((s) => ({ slug: s.slug, basePath: s.basePath }));

    if (action === "unlock" || action === "list") {
      return NextResponse.json({
        ok: true,
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "create-client") {
      const project = await ensureClientAccount({
        email: String(body.email || ""),
        password: String(body.password || ""),
        liveSiteSlug: body.liveSiteSlug ? String(body.liveSiteSlug) : "",
        title: body.title,
      });
      return NextResponse.json({
        ok: true,
        project: { ...project, portalPassword: "" },
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "update-client") {
      const project = await patchClient(String(body.email || ""), {
        title: body.title,
        password: body.password,
        liveSiteSlug: body.liveSiteSlug,
      });
      return NextResponse.json({
        ok: true,
        project: { ...project, portalPassword: project.portalPassword },
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "link-site") {
      const project = await patchClient(String(body.email || ""), {
        liveSiteSlug: String(body.liveSiteSlug || ""),
      });
      return NextResponse.json({
        ok: true,
        project: { ...project, portalPassword: project.portalPassword },
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "unlink-site") {
      const project = await patchClient(String(body.email || ""), { liveSiteSlug: null });
      return NextResponse.json({
        ok: true,
        project: { ...project, portalPassword: project.portalPassword },
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "get-client") {
      const email = String(body.email || "").trim().toLowerCase();
      const record = await readClientRecord(email);
      const catalog = await findByEmail(email);
      if (record) {
        await writeClientRecord({
          ...record,
          lastAdminViewAt: new Date().toISOString(),
        });
      }
      return NextResponse.json({
        ok: true,
        record,
        catalog: catalog
          ? {
              slug: catalog.slug,
              title: catalog.title,
              liveSiteSlug: catalog.liveSiteSlug || "",
              portalEmail: catalog.portalEmail,
              portalPassword: catalog.portalPassword || "",
              published: catalog.published,
            }
          : null,
        liveSitePath: catalog?.liveSiteSlug
          ? hostedPathForSlug(catalog.liveSiteSlug)
          : record?.liveSitePath || "",
        clients: await listAdminClients(),
        sites,
      });
    }

    if (action === "send-message") {
      const email = String(body.email || "").trim().toLowerCase();
      const text = String(body.message || "").trim();
      if (!email || !text) {
        return NextResponse.json({ error: "E-mail en boodschap zijn verplicht." }, { status: 400 });
      }
      const catalog = await findByEmail(email);
      const existing: ClientRecord = (await readClientRecord(email)) || {
        email,
        slug: catalog?.slug || email,
        title: catalog?.title || email,
        liveSiteSlug: catalog?.liveSiteSlug || "",
        liveSitePath: catalog?.liveSiteSlug ? hostedPathForSlug(catalog.liveSiteSlug) : "",
        lastLoginAt: null,
        updatedAt: new Date().toISOString(),
        lastAdminViewAt: null,
        clientActivityAt: null,
        adminMessages: [],
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
      return NextResponse.json({
        ok: true,
        record: existing,
        clients: await listAdminClients(),
      });
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
