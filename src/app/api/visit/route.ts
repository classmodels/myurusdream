import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { rememberVisitor } from "@/lib/visitors";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  if (/bot|crawl|spider|preview|facebookexternalhit|slurp/i.test(ua)) {
    return NextResponse.json({ count: 0, skipped: true });
  }
  const cookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith("myurusdream_vid="));
  let token = cookie?.slice("myurusdream_vid=".length) || "";
  if (!token || token.length < 16) {
    token = randomBytes(16).toString("hex");
  }
  const count = await rememberVisitor(token);
  const res = NextResponse.json({ count });
  res.cookies.set("myurusdream_vid", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return res;
}
