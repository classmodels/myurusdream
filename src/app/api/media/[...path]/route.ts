import { NextResponse } from "next/server";
import { mediaContentType, readUpload, safeUploadRelative } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { path: parts = [] } = await ctx.params;
  const relative = safeUploadRelative(parts);
  if (!relative) {
    return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  }

  const buffer = await readUpload(relative);
  if (!buffer) {
    return NextResponse.json({ error: "Bestand niet gevonden." }, { status: 404 });
  }

  const filename = parts[parts.length - 1] || "file";
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": mediaContentType(filename),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buffer.length),
    },
  });
}
