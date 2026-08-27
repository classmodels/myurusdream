import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession("participant");
  return NextResponse.redirect(new URL("/inloggen", process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001"));
}

export async function GET() {
  await clearSession("participant");
  return NextResponse.redirect(new URL("/inloggen", process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001"));
}
