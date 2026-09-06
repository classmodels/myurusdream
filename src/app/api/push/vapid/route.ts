import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = await getVapidPublicKey();
  return NextResponse.json({ key });
}
