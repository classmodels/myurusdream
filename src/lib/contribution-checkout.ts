import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getMollie, getMollieWebhookUrl, mollieConfigured, siteUrl } from "./mollie";
import { SITE_NAME } from "./constants";
import { audit } from "./audit";

export async function createContributionPayment(input: {
  userId: string;
  campaignId: string;
  amountCents: number;
  ip: string;
  userAgent: string | null;
}) {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      campaignId: input.campaignId,
      amountCents: input.amountCents,
      status: "pending",
      kind: "contribution",
      ipAddress: input.ip,
      userAgent: input.userAgent,
    },
  });

  await audit({
    actorId: input.userId,
    action: "checkout.started",
    entity: "Payment",
    entityId: payment.id,
    ip: input.ip,
  });

  return payment;
}

export async function contributionCheckoutResponse(payment: { id: string; userId: string; amountCents: number }) {
  if (!(await mollieConfigured())) {
    return NextResponse.json({
      paymentId: payment.id,
      simulate: true,
      notice: "Testmodus: Mollie-sleutel ontbreekt. U kunt lokaal een betaling simuleren.",
    });
  }

  try {
    const mollie = await getMollie();
    const webhook = await getMollieWebhookUrl();
    const created = await mollie.payments.create({
      amount: { currency: "EUR", value: (payment.amountCents / 100).toFixed(2) },
      description: `${SITE_NAME} — bijdrage €2`,
      redirectUrl: `${siteUrl()}/bedankt?pid=${payment.id}`,
      webhookUrl: webhook,
      metadata: { paymentId: payment.id, userId: payment.userId },
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mollieId: created.id },
    });
    const checkoutUrl = created.getCheckoutUrl();
    return NextResponse.json({ paymentId: payment.id, checkoutUrl, simulate: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mollie-fout";
    return NextResponse.json(
      { error: `Betaling starten mislukt: ${message}` },
      { status: 502 },
    );
  }
}
