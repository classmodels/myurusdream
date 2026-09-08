import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** After `prisma generate`, drop a stale singleton that lacks new models (dev only). */
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  const stale = globalForPrisma.prisma as PrismaClient & { challenge?: unknown };
  if (!stale.challenge) {
    void stale.$disconnect();
    globalForPrisma.prisma = undefined;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
