import { NextResponse } from "next/server";
import { listExtraPreviews, listTestSlots } from "@/lib/previews";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail en wachtwoord zijn verplicht." }, { status: 400 });
    }

    const all = [...(await listTestSlots()), ...(await listExtraPreviews())];
    const match = all.find((p) => {
      if (!p.portalEmail || !p.portalPassword) return false;
      if (p.slot && p.published !== true) return false;
      return p.portalEmail.toLowerCase() === email && p.portalPassword === password;
    });

    if (!match) {
      return NextResponse.json({ error: "Onjuiste login." }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      slug: match.slug,
      publicSlug: match.publicSlug || match.slug,
      title: match.title,
      previewUrl: match.previewUrl,
      progress: match.progress,
      accessCode: match.accessCode,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Inloggen mislukt." }, { status: 500 });
  }
}
