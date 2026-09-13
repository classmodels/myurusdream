import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession, hashToken } from "@/lib/auth";
import { siteUrl } from "@/lib/mollie";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${siteUrl()}/inloggen?error=missing`);
  }
  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
  });
  if (!session || session.expiresAt < new Date()) {
    return NextResponse.redirect(`${siteUrl()}/inloggen?error=expired`);
  }
  await prisma.session.delete({ where: { id: session.id } });
  await createUserSession(session.userId, "participant");
  return NextResponse.redirect(`${siteUrl()}/dashboard`);
}
