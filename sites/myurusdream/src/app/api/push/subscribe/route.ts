import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(4),
  }),
});

function endpointHash(endpoint: string) {
  return createHash("sha256").update(endpoint).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige inschrijving." }, { status: 400 });
  }
  const user = await getSessionUser("participant");
  const hash = endpointHash(parsed.data.endpoint);
  await prisma.pushDevice.upsert({
    where: { endpointHash: hash },
    update: {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId: user?.id ?? undefined,
    },
    create: {
      endpoint: parsed.data.endpoint,
      endpointHash: hash,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId: user?.id ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}
