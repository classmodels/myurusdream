import { NextResponse } from "next/server";
import { listHostedSites } from "@/lib/hosted-sites";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    sites: listHostedSites().map((s) => ({
      slug: s.slug,
      basePath: s.basePath,
      label: `${s.slug} (${s.basePath})`,
    })),
  });
}
