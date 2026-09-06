import { prisma } from "./prisma";

export async function getSetting(key: string) {
  const row = await prisma.siteContent.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await prisma.siteContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
