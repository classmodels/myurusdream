import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ paymentId: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { paymentId } = await ctx.params;
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      status: "paid",
      kind: { in: ["sponsor", "pixel"] },
    },
    select: { id: true, sponsorUrl: true },
  });

  if (!payment?.sponsorUrl) {
    return NextResponse.redirect(new URL("/sponsors", req.url), 302);
  }

  let target = payment.sponsorUrl.trim();
  if (!/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }

  try {
    await prisma.sponsorOutboundClick.create({
      data: {
        paymentId: payment.id,
        ip: clientIp(req.headers).slice(0, 64),
        userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
      },
    });
  } catch {
    /* still redirect */
  }

  return NextResponse.redirect(target, 302);
}
