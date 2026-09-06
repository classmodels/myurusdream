import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mollieConfigured } from "@/lib/mollie";
import { fulfillPaidPayment } from "@/lib/payments";
import { createUserSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export async function POST(req: Request) {
  if (mollieConfigured()) {
    return NextResponse.json(
      { error: "Simulatie is uitgeschakeld wanneer een Mollie test-sleutel actief is." },
      { status: 400 },
    );
  }
  const ip = clientIp(req.headers);
  if (mollieConfigured()) {
    const limited = rateLimit(`simulate:${ip}`, 20, 10 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = z.object({ paymentId: z.string().min(5) }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige betaling." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
  });
  if (!payment || payment.status === "paid") {
    return NextResponse.json({ error: "Betaling niet gevonden." }, { status: 404 });
  }

  const paid = await fulfillPaidPayment(payment.id);
  await createUserSession(paid.userId, "participant");
  const redirect = paid.kind === "pixel" ? `/koop-pixels?pid=${paid.id}` : `/bedankt?pid=${paid.id}`;
  return NextResponse.json({ ok: true, redirect });
}
