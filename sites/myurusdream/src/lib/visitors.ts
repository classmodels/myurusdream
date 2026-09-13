import { prisma } from "./prisma";

const ONLINE_WINDOW_SEC = 3 * 60;

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

export function brusselsDay(at = new Date()) {
  return at.toLocaleDateString("en-CA", { timeZone: "Europe/Brussels" });
}

export async function uniqueVisitorCount() {
  return prisma.uniqueVisitor.count();
}

export async function onlineVisitorCount() {
  return prisma.uniqueVisitor.count({
    where: { lastSeenUnix: { gte: nowUnix() - ONLINE_WINDOW_SEC } },
  });
}

export async function rememberVisitor(token: string) {
  const clean = token.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64);
  if (clean.length < 16) {
    return { total: await uniqueVisitorCount(), online: await onlineVisitorCount() };
  }
  const seen = nowUnix();
  const day = brusselsDay();
  await prisma.$transaction([
    prisma.uniqueVisitor.upsert({
      where: { token: clean },
      update: { lastSeenUnix: seen },
      create: { token: clean, lastSeenUnix: seen },
    }),
    prisma.dailyVisitor.upsert({
      where: { day_token: { day, token: clean } },
      update: {},
      create: { day, token: clean },
    }),
  ]);
  const [total, online] = await Promise.all([uniqueVisitorCount(), onlineVisitorCount()]);
  return { total, online };
}

export async function visitorsByDay(days = 30) {
  const start = brusselsDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
  const rows = await prisma.dailyVisitor.groupBy({
    by: ["day"],
    where: { day: { gte: start } },
    _count: { _all: true },
    orderBy: { day: "desc" },
  });
  return rows.map((row) => ({ day: row.day, count: row._count._all }));
}

export async function todayVisitorCount() {
  return prisma.dailyVisitor.count({ where: { day: brusselsDay() } });
}
