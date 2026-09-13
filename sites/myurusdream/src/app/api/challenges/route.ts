import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createChallenge, listChallenges } from "@/lib/challenges";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const challenges = await listChallenges();
  return NextResponse.json({ challenges, meId: user.id });
}

export async function POST(req: Request) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`challenge-create:${user.id}:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel challenges. Probeer later opnieuw." }, { status: 429 });
  }

  let body: {
    challengedId?: string;
    title?: string;
    stake?: string;
    endMode?: string;
    endsAt?: string;
    targetCents?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const endMode = body.endMode === "counter" ? "counter" : "date";
  try {
    const challenge = await createChallenge({
      challengerId: user.id,
      challengedId: String(body.challengedId || ""),
      title: String(body.title || ""),
      stake: String(body.stake || ""),
      endMode,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
      targetCents: typeof body.targetCents === "number" ? body.targetCents : null,
    });
    return NextResponse.json({ challenge });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Aanmaken mislukt." },
      { status: 400 },
    );
  }
}
