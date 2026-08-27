import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMollie, mollieConfigured } from "@/lib/mollie";
import { fulfillPaidPayment } from "@/lib/payments";

export async function POST(req: Request) {
  if (!mollieConfigured()) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const form = await req.formData().catch(() => null);
  const id =
    (form?.get("id") as string | null) ||
    new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const mollie = getMollie();
  const remote = await mollie.payments.get(id);
  const payment = await prisma.payment.findFirst({ where: { mollieId: id } });
  if (!payment) {
    return NextResponse.json({ ok: true, unknown: true });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { method: remote.method || payment.method },
  });

  if (remote.status === "paid") {
    await fulfillPaidPayment(payment.id);
  } else if (["failed", "expired", "canceled"].includes(remote.status)) {
    if (payment.status !== "paid") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: remote.status },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
