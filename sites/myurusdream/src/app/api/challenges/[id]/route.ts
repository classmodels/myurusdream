import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { acceptChallenge, declineChallenge } from "@/lib/challenges";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  try {
    if (body.action === "accept") {
      const challenge = await acceptChallenge(id, user.id);
      return NextResponse.json({ challenge });
    }
    if (body.action === "decline") {
      const challenge = await declineChallenge(id, user.id);
      return NextResponse.json({ challenge });
    }
    return NextResponse.json({ error: "Onbekende actie." }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Actie mislukt." },
      { status: 400 },
    );
  }
}
