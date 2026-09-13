import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  PREVIEW_MANAGE_CODE,
  getPreviewProject,
  readCatalog,
  slotNumberFromSlug,
  writeCatalog,
  type PreviewProject,
} from "@/lib/previews";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function uploadsDir(slug: string) {
  return path.join(process.cwd(), "public", "uploads", "previews", slug, "pages");
}

function publicUrl(slug: string, filename: string) {
  return `/uploads/previews/${slug}/pages/${filename}`;
}

async function upsertCatalog(project: PreviewProject) {
  const catalog = await readCatalog();
  const without = catalog.filter((p) => p.slug !== project.slug);
  await writeCatalog([...without, project]);
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (String(form.get("manageCode") || "") !== PREVIEW_MANAGE_CODE) {
      return NextResponse.json({ error: "Onjuiste beheercode." }, { status: 401 });
    }

    const slug = String(form.get("slug") || "").trim();
    const kind = String(form.get("kind") || "page") === "logo" ? "logo" : "page";
    const title = String(form.get("title") || "").trim() || (kind === "logo" ? "Logo" : "Pagina");
    const file = form.get("file");

    if (!slug || slotNumberFromSlug(slug) == null) {
      return NextResponse.json({ error: "Kies eerst een testsite (1–10)." }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Geen bestand gekozen." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Afbeelding mag max. 8 MB zijn." }, { status: 400 });
    }
    if (file.type && !ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Alleen JPG, PNG, WebP of GIF." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const safe = `${kind}-${Date.now()}.${ext}`;
    const dir = uploadsDir(slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
    const imageUrl = publicUrl(slug, safe);

    const current = (await getPreviewProject(slug))!;
    const next: PreviewProject = {
      ...current,
      logoUrl: kind === "logo" ? imageUrl : current.logoUrl,
      pages:
        kind === "page"
          ? [...(current.pages || []), { title, imageUrl }]
          : current.pages || [],
    };
    await upsertCatalog(next);

    return NextResponse.json({ ok: true, imageUrl, project: next });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload mislukt." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as {
      manageCode?: string;
      slug?: string;
      imageUrl?: string;
      kind?: "logo" | "page";
    };
    if (String(body.manageCode || "") !== PREVIEW_MANAGE_CODE) {
      return NextResponse.json({ error: "Onjuiste beheercode." }, { status: 401 });
    }

    const slug = String(body.slug || "").trim();
    const imageUrl = String(body.imageUrl || "").trim();
    const current = await getPreviewProject(slug);
    if (!current || slotNumberFromSlug(slug) == null) {
      return NextResponse.json({ error: "Testsite niet gevonden." }, { status: 404 });
    }

    const next: PreviewProject = {
      ...current,
      logoUrl: body.kind === "logo" || current.logoUrl === imageUrl ? "" : current.logoUrl,
      pages: (current.pages || []).filter((p) => p.imageUrl !== imageUrl),
    };
    await upsertCatalog(next);

    if (imageUrl.startsWith(`/uploads/previews/${slug}/`)) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      await unlink(filePath).catch(() => undefined);
    }

    return NextResponse.json({ ok: true, project: next });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verwijderen mislukt." }, { status: 500 });
  }
}
