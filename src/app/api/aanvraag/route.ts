import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILES = 8;
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const type = String(form.get("type") || "offerte");
    const naam = String(form.get("naam") || "").trim();
    const email = String(form.get("email") || "").trim();

    if (!naam || !email) {
      return NextResponse.json({ error: "Naam en e-mail zijn verplicht." }, { status: 400 });
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const folderName = `${type}-${stamp}-${naam.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);
    await mkdir(uploadDir, { recursive: true });

    const files = form.getAll("bestanden").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} bestanden.` }, { status: 400 });
    }

    const savedFiles: string[] = [];
    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `${file.name} is groter dan 25 MB.` },
          { status: 400 },
        );
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, safeName), bytes);
      savedFiles.push(safeName);
    }

    const payload: Record<string, string | string[]> = { type, receivedAt: new Date().toISOString() };
    form.forEach((value, key) => {
      if (key === "bestanden") return;
      if (typeof value === "string") payload[key] = value;
    });
    payload.bestanden = savedFiles;

    await writeFile(path.join(uploadDir, "aanvraag.json"), JSON.stringify(payload, null, 2), "utf8");

    return NextResponse.json({
      ok: true,
      message:
        type === "briefing"
          ? "Briefing ontvangen. We bekijken uw bestanden en koppelen dit aan uw project."
          : "Offerteaanvraag ontvangen. U krijgt binnen 24 uur een reactie van SitePilot.",
      id: folderName,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Opslaan mislukt. Probeer opnieuw." }, { status: 500 });
  }
}
