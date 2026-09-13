import { NextResponse } from "next/server";
import { mediaContentType, readUpload, safeUploadRelative } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ path?: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { path: parts = [] } = await ctx.params;
  const relative = safeUploadRelative(parts);
  if (!relative) {
    return NextResponse.json(
      { error: "Niet gevonden." },
      { status: 404, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const buffer = await readUpload(relative);
  if (!buffer) {
    return NextResponse.json(
      { error: "Bestand niet gevonden." },
      { status: 404, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const filename = parts[parts.length - 1] || "file";
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": mediaContentType(filename),
      // Unique hashed filenames; short cache so browsers recover after a bad 404.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Length": String(buffer.length),
    },
  });
}
