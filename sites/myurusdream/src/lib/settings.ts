import { prisma } from "./prisma";

export async function getSetting(key: string) {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string) {
  try {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (error) {
    console.error("setSetting", key, error);
  }
}
