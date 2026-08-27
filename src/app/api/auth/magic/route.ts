import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/mollie";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`magic:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = z.object({ email: z.string().email() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig e-mailadres." }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "participant") {
    return NextResponse.json({
      ok: true,
      message: "Als dit e-mailadres meedeed, sturen we een toegangslink.",
    });
  }
  const paid = await prisma.payment.findFirst({
    where: { userId: user.id, status: "paid" },
  });
  if (!paid) {
    return NextResponse.json({
      ok: true,
      message: "Als dit e-mailadres meedeed, sturen we een toegangslink.",
    });
  }

  const token = generateToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      token: hashToken(token),
      kind: "participant",
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  });
  const link = `${siteUrl()}/api/auth/callback?token=${token}`;
  await audit({
    actorId: user.id,
    action: "auth.magic_created",
    entity: "User",
    entityId: user.id,
    ip,
  });

  return NextResponse.json({
    ok: true,
    message:
      "Geen e-mailserver geconfigureerd. Gebruik de lokale toegangslink hieronder.",
    localLink: process.env.NODE_ENV === "production" ? undefined : link,
  });
}
