import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url().max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geen toestel." }, { status: 400 });
  }
  const hash = createHash("sha256").update(parsed.data.endpoint).digest("hex");
  const device = await prisma.pushDevice.findUnique({ where: { endpointHash: hash } });
  if (!device) {
    return NextResponse.json({ error: "Toestel niet gevonden." }, { status: 404 });
  }
  await sendPush(
    [device],
    "Meldingen staan aan",
    "Dit is een test. Zo ziet u later ook punten en stortingen.",
    "/dashboard",
    "test",
    1,
  );
  return NextResponse.json({ ok: true });
}
