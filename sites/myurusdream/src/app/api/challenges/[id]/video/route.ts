import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { uploadChallengeVideo } from "@/lib/challenges";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const user = await getSessionUser("participant");
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`challenge-video:${user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Te veel uploads. Probeer later opnieuw." }, { status: 429 });
  }

  const { id } = await ctx.params;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldige upload." }, { status: 400 });
  }

  const file = form.get("video");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Kies een filmpje (MP4 of WebM)." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Alleen MP4, WebM of MOV." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Filmpje max. 20 MB." }, { status: 400 });
  }

  const ext =
    file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveUpload("challenges", filename, buffer);

  try {
    const challenge = await uploadChallengeVideo(id, user.id, saved.publicUrl);
    return NextResponse.json({ challenge });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload mislukt." },
      { status: 400 },
    );
  }
}
