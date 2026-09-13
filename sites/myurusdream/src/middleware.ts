import { NextRequest, NextResponse } from "next/server";
import { REF_COOKIE, parseShareCode } from "@/lib/referral";

export function middleware(req: NextRequest) {
  const code = parseShareCode(req.nextUrl.href);
  if (!code) return NextResponse.next();
  const res = NextResponse.next();
  res.cookies.set(REF_COOKIE, code, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
  });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
