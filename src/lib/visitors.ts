import { prisma } from "./prisma";

const ONLINE_WINDOW_MS = 3 * 60 * 1000;

export async function uniqueVisitorCount() {
  return prisma.uniqueVisitor.count();
}

export async function onlineVisitorCount() {
  return prisma.uniqueVisitor.count({
    where: { lastSeenAt: { gte: new Date(Date.now() - ONLINE_WINDOW_MS) } },
  });
}

export async function rememberVisitor(token: string) {
  const clean = token.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (clean.length < 16) {
    return { total: await uniqueVisitorCount(), online: await onlineVisitorCount() };
  }
  await prisma.uniqueVisitor.upsert({
    where: { token: clean },
    update: { lastSeenAt: new Date() },
    create: { token: clean, lastSeenAt: new Date() },
  });
  const [total, online] = await Promise.all([uniqueVisitorCount(), onlineVisitorCount()]);
  return { total, online };
}
