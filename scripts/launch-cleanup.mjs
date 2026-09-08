/**
 * One-shot launch cleanup for Combell serve.
 * - Sets campaign start 9 Sep 2026 and end 31 Oct 2026
 * - Updates homepage story text
 * - Removes ALL test participants (keeps admins + Van Gyzel Alain)
 * - Also removes their paid contributions from the live counter
 * Runs once per FLAG version.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const FLAG = "launch_cleanup_20260908_v2";
const prisma = new PrismaClient();

function loadHomeStory() {
  const root = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(root, "../src/lib/home-story.ts"), "utf8");
  const match = src.match(/export const HOME_STORY_PLAIN = `([\s\S]*?)`;/);
  if (!match) throw new Error("HOME_STORY_PLAIN not found in src/lib/home-story.ts");
  return match[1];
}

function keepParticipant(user) {
  if (user.role === "admin") return true;
  const full = `${user.firstName || ""} ${user.lastName || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const compact = full.replace(/\s+/g, "");
  const email = String(user.email || "").toLowerCase();
  const isAlain = full.includes("alain") || email.includes("alain");
  const isVanGyzel =
    full.includes("van gyzel") ||
    compact.includes("vangyzel") ||
    full.includes("gyzel") ||
    email.includes("vangyzel") ||
    email.includes("gyzel");
  return isAlain && isVanGyzel;
}

async function removeUser(user) {
  console.log(`removing test user ${user.firstName || ""} ${user.lastName || ""} <${user.email}>`);

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.pushDevice.deleteMany({ where: { userId: user.id } }).catch(() => null);
  await prisma.noticeRead.deleteMany({ where: { userId: user.id } }).catch(() => null);
  await prisma.referral.deleteMany({
    where: { OR: [{ referrerId: user.id }, { referredUserId: user.id }] },
  });
  await prisma.pointsTransaction.deleteMany({ where: { userId: user.id } });
  await prisma.prizeEntry.deleteMany({ where: { userId: user.id } });
  await prisma.legalAcceptance.deleteMany({ where: { userId: user.id } });
  // Remove payments so test €2 no longer counts on the live teller.
  await prisma.payment.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

async function main() {
  const storyText = loadHomeStory();
  const campaign = await prisma.campaign.findFirst({ where: { slug: "myurusdream" } });
  if (!campaign) throw new Error("Campaign myurusdream not found");

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { storyText },
  });
  console.log("campaign story text updated");

  const done = await prisma.siteContent.findUnique({ where: { key: FLAG } });
  if (done?.value === "1") {
    console.log("launch cleanup v2 already done — skip dates/users");
    return;
  }

  const startDate = new Date("2026-09-09T00:00:00+02:00");
  const endDate = new Date("2026-10-31T23:59:59+02:00");

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { startDate, endDate },
  });
  console.log("campaign dates set: 9 Sep 2026 → 31 Oct 2026");

  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });

  let kept = 0;
  let removed = 0;
  for (const user of users) {
    if (keepParticipant(user)) {
      kept += 1;
      console.log(`keep ${user.role} ${user.firstName || ""} ${user.lastName || ""} <${user.email}>`);
      continue;
    }
    await removeUser(user);
    removed += 1;
  }

  // Also clear anonymized leftovers from v1 cleanup (deleted-*.@deleted.local).
  const leftovers = await prisma.user.findMany({
    where: { email: { contains: "@deleted.local" } },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  });
  for (const user of leftovers) {
    if (keepParticipant(user)) continue;
    await removeUser(user);
    removed += 1;
  }

  await prisma.siteContent.upsert({
    where: { key: FLAG },
    update: { value: "1" },
    create: { key: FLAG, value: "1" },
  });

  console.log(`launch cleanup v2 finished — kept ${kept}, removed ${removed}`);
}

main()
  .catch((error) => {
    console.error("launch cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
