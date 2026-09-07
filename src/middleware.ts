import { NextRequest, NextResponse } from "next/server";
import { REF_COOKIE, referralFromPathname } from "@/lib/referral";

export function middleware(req: NextRequest) {
  const fromQuery = (req.nextUrl.searchParams.get("ref") || "").trim().slice(0, 32);
  const fromPath = referralFromPathname(req.nextUrl.pathname);
  const code = fromQuery || fromPath;
  if (!code) return NextResponse.next();
  const res = NextResponse.next();
  res.cookies.set(REF_COOKIE, code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/", "/meedoen/:path*"],
};
