import { NextResponse } from "next/server";
import {
  PREVIEW_MANAGE_CODE,
  listAllPreviews,
  listExtraPreviews,
  listTestSlots,
  makeEmptySlot,
  previewProjects,
  randomAccessCode,
  readCatalog,
  slugifyPreview,
  slotNumberFromSlug,
  writeCatalog,
  isPublicPreview,
  RESERVED_PUBLIC_SLUGS,
  type PreviewProject,
} from "@/lib/previews";
import { listHostedSites } from "@/lib/hosted-sites";

export const runtime = "nodejs";

function asProject(raw: Partial<PreviewProject>, fallbackSlug: string): PreviewProject | null {
  const title = String(raw.title || "").trim();
  if (!title) return null;
  const slot = raw.slot ? Number(raw.slot) : slotNumberFromSlug(String(raw.slug || fallbackSlug));
  const slug = slot ? `testsite-${slot}` : slugifyPreview(String(raw.slug || title || fallbackSlug));
  const progress = Math.min(100, Math.max(0, Number(raw.progress) || 0));
  let accessCode = String(raw.accessCode || "").trim();
  if (!accessCode && slot) accessCode = randomAccessCode(slot);
  if (!accessCode) return null;
  const changelogRaw = raw.changelog;
  const changelog =
    Array.isArray(changelogRaw) && changelogRaw.length
      ? changelogRaw
          .map((row) => ({
            date: String(row.date || "").trim() || "Nu",
            text: String(row.text || "").trim(),
          }))
          .filter((row) => row.text)
      : [{ date: "Nu", text: "Testsite klaargezet voor de klant." }];

  const pages = Array.isArray(raw.pages)
    ? raw.pages
        .map((page) => ({
          title: String(page.title || "Pagina").trim() || "Pagina",
          imageUrl: String(page.imageUrl || "").trim(),
        }))
        .filter((page) => page.imageUrl)
    : [];

  return {
    slug,
    slot: slot || undefined,
    title,
    clientLabel: String(raw.clientLabel || "In opbouw").trim() || "In opbouw",
    summary: String(raw.summary || "").trim() || "Website in ontwikkeling bij SiteButler.",
    progress,
    accessCode,
    previewUrl: isPublicPreview(String(raw.previewUrl || "").trim())
      ? String(raw.previewUrl).trim()
      : "",
    changelog,
    published: Boolean(raw.published),
    accent: String(raw.accent || "#2563eb").trim() || "#2563eb",
    accent2: String(raw.accent2 || "#0f766e").trim() || "#0f766e",
    tagline: String(raw.tagline || "").trim(),
    heroText: String(raw.heroText || "").trim(),
    about: String(raw.about || "").trim(),
    services: String(raw.services || "").trim(),
    contact: String(raw.contact || "").trim(),
    logoUrl: String(raw.logoUrl || "").trim(),
    pages,
    publicSlug: (() => {
      const s = slugifyPreview(String(raw.publicSlug || raw.title || fallbackSlug));
      return RESERVED_PUBLIC_SLUGS.has(s) ? `${s}-site` : s;
    })(),
    portalEmail: String(raw.portalEmail || "").trim().toLowerCase(),
    portalPassword: String(raw.portalPassword || "").trim(),
    liveSiteSlug: String(raw.liveSiteSlug || "").trim().toLowerCase(),
  };
}

function studioPayload(slots: PreviewProject[], extras: PreviewProject[]) {
  // Wachtwoorden nooit terug naar de browser sturen — lege update bewaart het bestaande.
  const reveal = (p: PreviewProject) => ({
    ...p,
    accessCode: p.accessCode,
    portalPassword: "",
    hasPortalPassword: Boolean(p.portalPassword),
  });
  return { slots: slots.map(reveal), extras: extras.map(reveal) };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      manageCode?: string;
      action?: "add" | "update" | "delete" | "unlock" | "clear" | "link-client";
      project?: Partial<PreviewProject>;
      slug?: string;
      email?: string;
      password?: string;
      liveSiteSlug?: string;
    };

    if (String(body.manageCode || "") !== PREVIEW_MANAGE_CODE) {
      return NextResponse.json({ error: "Onjuiste beheercode." }, { status: 401 });
    }

    const action = body.action || "add";
    if (action === "unlock") {
      return NextResponse.json({
        ok: true,
        ...studioPayload(await listTestSlots(), await listExtraPreviews()),
        sites: listHostedSites().map((s) => ({ slug: s.slug, basePath: s.basePath })),
      });
    }

    if (action === "link-client") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "").trim();
      const liveSiteSlug = String(body.liveSiteSlug || "").trim().toLowerCase();
      if (!email || !password || !liveSiteSlug) {
        return NextResponse.json(
          { error: "E-mail, wachtwoord en site zijn verplicht." },
          { status: 400 },
        );
      }
      const hosted = listHostedSites().find((s) => s.slug === liveSiteSlug);
      if (!hosted) {
        return NextResponse.json({ error: "Die live site bestaat niet." }, { status: 400 });
      }

      const slots = await listTestSlots();
      const extras = await listExtraPreviews();
      const current = [...slots, ...extras].find((p) => p.portalEmail === email);
      const free = slots.find((p) => !p.portalEmail);
      const base = current || free;
      if (!base) {
        return NextResponse.json(
          { error: "Geen vrije plek meer. Verwijder eerst een oude koppeling." },
          { status: 400 },
        );
      }

      const catalog = await readCatalog();
      const parsed = asProject(
        {
          ...base,
          title: hosted.slug,
          clientLabel: email,
          portalEmail: email,
          portalPassword: password,
          liveSiteSlug,
          published: true,
          accessCode: base.accessCode || randomAccessCode(base.slot || 1),
        },
        base.slug,
      );
      if (!parsed) {
        return NextResponse.json({ error: "Koppelen mislukt." }, { status: 400 });
      }
      await writeCatalog([...catalog.filter((p) => p.slug !== parsed.slug), parsed]);
      return NextResponse.json({
        ok: true,
        project: { ...parsed, portalPassword: "" },
        ...studioPayload(await listTestSlots(), await listExtraPreviews()),
        sites: listHostedSites().map((s) => ({ slug: s.slug, basePath: s.basePath })),
      });
    }

    const catalog = await readCatalog();

    if (action === "clear") {
      const slug = String(body.slug || "").trim();
      const slot = slotNumberFromSlug(slug);
      if (slot) {
        await writeCatalog([...catalog.filter((p) => p.slug !== slug), makeEmptySlot(slot)]);
      } else {
        if (previewProjects.some((p) => p.slug === slug)) {
          return NextResponse.json(
            { error: "Dit standaardproject kunt u niet verwijderen." },
            { status: 400 },
          );
        }
        await writeCatalog(catalog.filter((p) => p.slug !== slug));
      }
      return NextResponse.json({
        ok: true,
        ...studioPayload(await listTestSlots(), await listExtraPreviews()),
      });
    }

    if (action === "delete") {
      const slug = String(body.slug || "").trim();
      if (previewProjects.some((p) => p.slug === slug)) {
        return NextResponse.json(
          { error: "Dit standaardproject kunt u niet verwijderen, wel overschrijven." },
          { status: 400 },
        );
      }
      await writeCatalog(catalog.filter((p) => p.slug !== slug));
      return NextResponse.json({
        ok: true,
        ...studioPayload(await listTestSlots(), await listExtraPreviews()),
      });
    }

    const existing = body.project?.slug
      ? catalog.find((p) => p.slug === body.project?.slug) || (await listTestSlots()).find((p) => p.slug === body.project?.slug)
      : undefined;

    // Lege portal-velden mogen bestaande login/site-koppeling NOOIT wissen
    // (gebeurde o.a. bij opslaan in PreviewStudio zonder wachtwoord opnieuw in te vullen).
    const nextPassword = String(body.project?.portalPassword ?? "").trim();
    const nextEmail = String(body.project?.portalEmail ?? "").trim().toLowerCase();
    const nextLive = String(body.project?.liveSiteSlug ?? "").trim().toLowerCase();

    const merged: Partial<PreviewProject> = {
      ...existing,
      ...body.project,
      pages: body.project?.pages ?? existing?.pages,
      logoUrl: body.project?.logoUrl ?? existing?.logoUrl,
      accessCode: String(body.project?.accessCode || existing?.accessCode || "").trim(),
      portalPassword: nextPassword || existing?.portalPassword || "",
      portalEmail: nextEmail || existing?.portalEmail || "",
      liveSiteSlug: nextLive || existing?.liveSiteSlug || "",
    };

    const parsed = asProject(merged, String(body.slug || "project"));
    if (!parsed) {
      return NextResponse.json(
        { error: "Naam van de site is verplicht." },
        { status: 400 },
      );
    }

    const without = catalog.filter((p) => p.slug !== parsed.slug);
    await writeCatalog([...without, parsed]);
    return NextResponse.json({
      ok: true,
      project: parsed,
      ...studioPayload(await listTestSlots(), await listExtraPreviews()),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }
}

export async function GET() {
  const all = await listAllPreviews();
  return NextResponse.json({
    projects: all.map((p) => ({
      slug: p.slug,
      title: p.title,
      clientLabel: p.clientLabel,
      summary: p.summary,
      progress: p.progress,
      previewUrl: p.previewUrl,
      published: p.published,
    })),
  });
}
