import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { searchPaidParticipants } from "@/lib/challenges";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q") || "";
  const results = await searchPaidParticipants(q, user.id);
  return NextResponse.json({ results });
}
