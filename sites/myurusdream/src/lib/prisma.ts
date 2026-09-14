import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "mysql://unused:unused@127.0.0.1:3306/unused";
  }
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Prisma startte niet.", error);
    return new PrismaClient({
      datasources: { db: { url: "mysql://unused:unused@127.0.0.1:3306/unused" } },
      log: ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
