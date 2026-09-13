import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveUpload } from "@/lib/uploads";

const MAX_BYTES = 900_000;
const DATA_URL = /^data:image\/(jpeg|jpg|png|webp);base64,([a-zA-Z0-9+/=\s]+)$/;

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`pixel-logo:${ip}`, 80, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel uploads. Probeer later opnieuw." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const dataUrl =
    typeof body === "object" && body && "dataUrl" in body
      ? String((body as { dataUrl: string }).dataUrl)
      : "";
  const match = DATA_URL.exec(dataUrl.trim());
  if (!match) {
    return NextResponse.json(
      { error: "Upload een JPG, PNG of WebP. Het bestand is te groot of ongeldig." },
      { status: 400 },
    );
  }

  const ext = match[1] === "png" ? "png" : match[1] === "webp" ? "webp" : "jpg";
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: "Het logo is te groot. Gebruik een kleiner bestand (max. ±900 KB)." },
      { status: 400 },
    );
  }

  const filename = `${randomBytes(12).toString("hex")}.${ext}`;
  let saved: { publicUrl: string; absolutePath: string };
  try {
    saved = await saveUpload("pixels", filename, buffer);
  } catch (err) {
    console.error("logo upload save failed", err);
    return NextResponse.json(
      { error: "Logo opslaan mislukte op de server. Probeer opnieuw." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: saved.publicUrl,
    bytes: buffer.length,
  });
}
