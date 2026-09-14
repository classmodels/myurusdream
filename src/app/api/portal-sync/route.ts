import { NextResponse } from "next/server";
import { hostedPathForSlug } from "@/lib/hosted-sites";
import { readClientRecord, writeClientRecord, type AdminMessage } from "@/lib/portal-clients";
import { listExtraPreviews, listTestSlots } from "@/lib/previews";
import type { PortalState } from "@/lib/portal";

export const runtime = "nodejs";

/** Klantportaal: sync state + last login; ophalen adminberichten */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "sync" | "login" | "fetch" | "mark-read";
      email?: string;
      portal?: Partial<PortalState>;
    };
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "E-mail verplicht." }, { status: 400 });
    }

    const slots = await listTestSlots();
    const extras = await listExtraPreviews();
    const catalog = [...slots, ...extras].find((p) => p.portalEmail === email);
    const liveSiteSlug = catalog?.liveSiteSlug || "";
    const base = (await readClientRecord(email)) || {
      email,
      slug: catalog?.slug || email,
      title: catalog?.title || email,
      liveSiteSlug,
      liveSitePath: liveSiteSlug ? hostedPathForSlug(liveSiteSlug) : "",
      lastLoginAt: null as string | null,
      updatedAt: new Date().toISOString(),
      adminMessages: [] as AdminMessage[],
      portal: null as Partial<PortalState> | null,
    };

    if (body.action === "login") {
      base.lastLoginAt = new Date().toISOString();
      base.updatedAt = base.lastLoginAt;
      if (catalog) {
        base.slug = catalog.slug;
        base.title = catalog.title;
        base.liveSiteSlug = catalog.liveSiteSlug || "";
        base.liveSitePath = base.liveSiteSlug ? hostedPathForSlug(base.liveSiteSlug) : "";
      }
      await writeClientRecord(base);
      return NextResponse.json({ ok: true, record: base });
    }

    if (body.action === "sync" && body.portal) {
      base.portal = body.portal;
      base.updatedAt = new Date().toISOString();
      if (catalog) {
        base.title = catalog.title || base.title;
        base.liveSiteSlug = catalog.liveSiteSlug || base.liveSiteSlug;
        base.liveSitePath = base.liveSiteSlug ? hostedPathForSlug(base.liveSiteSlug) : base.liveSitePath;
      }
      await writeClientRecord(base);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "mark-read") {
      base.adminMessages = (base.adminMessages || []).map((m) => ({ ...m, read: true }));
      await writeClientRecord(base);
      return NextResponse.json({ ok: true, record: base });
    }

    // fetch
    return NextResponse.json({
      ok: true,
      record: base,
      adminMessages: base.adminMessages || [],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sync mislukt." }, { status: 500 });
  }
}
