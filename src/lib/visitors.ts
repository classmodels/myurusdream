import { prisma } from "./prisma";

export async function uniqueVisitorCount() {
  return prisma.uniqueVisitor.count();
}

export async function rememberVisitor(token: string) {
  const clean = token.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (clean.length < 16) {
    return uniqueVisitorCount();
  }
  await prisma.uniqueVisitor.upsert({
    where: { token: clean },
    update: {},
    create: { token: clean },
  });
  return uniqueVisitorCount();
}
