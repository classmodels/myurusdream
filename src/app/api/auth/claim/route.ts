import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSession, getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  paymentId: z.string().min(8),
});

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`claim:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige betaling." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
  });
  if (!payment || payment.status !== "paid") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const paidAt = payment.paidAt?.getTime() ?? payment.updatedAt.getTime();
  if (Date.now() - paidAt > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ ok: false, expired: true }, { status: 410 });
  }

  const existing = await getSessionUser("participant");
  if (existing?.id === payment.userId) {
    return NextResponse.json({ ok: true, already: true });
  }

  await createUserSession(payment.userId, "participant", 365);
  return NextResponse.json({ ok: true });
}
