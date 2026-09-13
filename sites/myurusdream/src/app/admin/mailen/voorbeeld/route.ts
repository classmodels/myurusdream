import { getSessionUser } from "@/lib/auth";
import { sampleMailHtml } from "@/lib/mail-voorbeeld";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getSessionUser("admin");
  if (!admin) return new Response("Unauthorized", { status: 401 });
  return new Response(sampleMailHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
