import { NextResponse } from "next/server";
import { createUserSession, verifyAdminPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { audit } from "@/lib/audit";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limited = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel pogingen." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige gegevens." }, { status: 400 });
  }
  const user = await verifyAdminPassword(
    parsed.data.email.trim().toLowerCase(),
    parsed.data.password,
  );
  if (!user) {
    return NextResponse.json({ error: "Onjuiste login." }, { status: 401 });
  }
  await createUserSession(user.id, "admin", 1);
  await audit({
    actorId: user.id,
    action: "admin.login",
    entity: "User",
    entityId: user.id,
    ip,
  });
  return NextResponse.json({ ok: true });
}
