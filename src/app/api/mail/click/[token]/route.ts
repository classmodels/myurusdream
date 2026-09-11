import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/mollie";

export const dynamic = "force-dynamic";

function safeTo(raw: string | null, fallback: string) {
  if (!raw) return fallback;
  try {
    const dest = new URL(raw);
    const home = new URL(fallback);
    if (dest.origin === home.origin) return dest.toString();
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const fallback = siteUrl() || "https://myurusdream.be";
  const dest = safeTo(req.nextUrl.searchParams.get("to"), fallback);
  if (token) {
    const now = new Date();
    await prisma.mailSend
      .updateMany({
        where: { token },
        data: { readAt: now },
      })
      .catch(() => null);
    await prisma.mailSend
      .updateMany({
        where: { token, openedAt: null },
        data: { openedAt: now },
      })
      .catch(() => null);
  }
  return NextResponse.redirect(dest, 302);
}
