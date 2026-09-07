import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";

export const ADMIN_PATHS = [
  "/admin",
  "/admin/accounts",
  "/admin/sponsors",
  "/admin/pixels",
  "/admin/bezoekers",
  "/admin/mailen",
  "/admin/faq",
  "/admin/campagne",
  "/admin/betalingen",
  "/admin/instellingen",
] as const;

export async function requireAdminPage() {
  const user = await getSessionUser("admin");
  if (!user) redirect("/admin/login");
  return user;
}

export function revalidateAdmin() {
  for (const path of ADMIN_PATHS) revalidatePath(path);
}
