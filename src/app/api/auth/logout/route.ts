import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { REF_COOKIE } from "@/lib/referral";
import { siteUrl } from "@/lib/mollie";

function redirectAfterLogout() {
  const res = NextResponse.redirect(new URL("/inloggen?resetRef=1", siteUrl()));
  // Wis referral-cookie zodat een latere teststorting niet per ongeluk aan u hangt.
  res.cookies.set(REF_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function POST() {
  await clearSession("participant");
  return redirectAfterLogout();
}

export async function GET() {
  await clearSession("participant");
  return redirectAfterLogout();
}
