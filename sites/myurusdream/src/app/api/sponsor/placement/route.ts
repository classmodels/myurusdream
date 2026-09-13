import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSafePixelImageUrl } from "@/lib/pixel-image";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`sponsor-edit:${user.id}:${ip}`, 40, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel wijzigingen. Probeer later." }, { status: 429 });
  }

  let body: { paymentId?: string; pixelImage?: string; sponsorUrl?: string; pixelLabel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const paymentId = String(body.paymentId || "");
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId: user.id,
      status: "paid",
      kind: { in: ["sponsor", "pixel"] },
    },
  });
  if (!payment) {
    return NextResponse.json({ error: "Sponsorplaats niet gevonden." }, { status: 404 });
  }

  const data: { pixelImage?: string | null; sponsorUrl?: string | null; pixelLabel?: string | null } =
    {};

  if (typeof body.pixelImage === "string") {
    const image = body.pixelImage.trim();
    if (image && !isSafePixelImageUrl(image)) {
      return NextResponse.json({ error: "Ongeldig logo. Upload opnieuw." }, { status: 400 });
    }
    data.pixelImage = image || null;
  }
  if (typeof body.sponsorUrl === "string") {
    const url = body.sponsorUrl.trim().slice(0, 200);
    data.sponsorUrl = url || null;
  }
  if (typeof body.pixelLabel === "string") {
    data.pixelLabel = body.pixelLabel.trim().slice(0, 80) || null;
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Niets te wijzigen." }, { status: 400 });
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data,
    select: {
      id: true,
      sponsorName: true,
      sponsorUrl: true,
      sponsorTier: true,
      pixelImage: true,
      pixelLabel: true,
      amountCents: true,
    },
  });

  return NextResponse.json({ payment: updated });
}
