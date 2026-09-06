import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { isLikelyPhone, normalizePhone, phonesMatch } from "@/lib/phone";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().trim().min(8).max(24),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vul e-mailadres en gsm-nummer in." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const phoneNormalized = normalizePhone(parsed.data.phone);
  if (!isLikelyPhone(phoneNormalized)) {
    return NextResponse.json({ error: "Vul een geldig gsm-nummer in." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const generic = "E-mailadres en gsm-nummer horen niet bij een bevestigde bijdrage.";
  if (!user || user.role !== "participant" || user.blocked) {
    return NextResponse.json({ error: generic }, { status: 401 });
  }
  if (!phonesMatch(user.phone, user.phoneNormalized, parsed.data.phone)) {
    return NextResponse.json({ error: generic }, { status: 401 });
  }

  const paid = await prisma.payment.findFirst({
    where: { userId: user.id, status: "paid" },
  });
  if (!paid) {
    return NextResponse.json({ error: generic }, { status: 401 });
  }

  if (!user.phoneNormalized) {
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneNormalized, lastIp: ip },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastIp: ip },
    });
  }

  await createUserSession(user.id, "participant", 365);
  await audit({
    actorId: user.id,
    action: "auth.login",
    entity: "User",
    entityId: user.id,
    ip,
  });

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
