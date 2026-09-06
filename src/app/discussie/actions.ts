import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function postComment(formData: FormData) {
  const hdrs = await headers();
  const ip = clientIp(hdrs);
  const limited = rateLimit(`comment:${ip}`, 8, 30 * 60 * 1000);
  if (!limited.ok) {
    throw new Error("Te veel berichten. Wacht even.");
  }
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const body = String(formData.get("body") || "").trim().slice(0, 1000);
  if (name.length < 2 || body.length < 8) {
    throw new Error("Vul een naam en een mening in.");
  }
  await prisma.discussionPost.create({
    data: { name, body, ip: ip.slice(0, 64), published: true },
  });
  revalidatePath("/discussie");
}

export async function hideComment(formData: FormData) {
  const admin = await getSessionUser("admin");
  if (!admin) throw new Error("Niet ingelogd als admin.");
  const id = String(formData.get("id") || "");
  await prisma.discussionPost.update({ where: { id }, data: { published: false } });
  revalidatePath("/discussie");
  revalidatePath("/admin");
}
