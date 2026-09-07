/**
 * One-shot launch cleanup for Combell serve.
 * - Sets campaign start 9 Sep 2026 and end 31 Oct 2026
 * - Removes test participants (keeps admins + Van Gyzel Alain)
 * Runs only once (SiteContent flag).
 */
import { PrismaClient } from "@prisma/client";

const FLAG = "launch_cleanup_20260908";
const prisma = new PrismaClient();

function keepParticipant(user) {
  if (user.role === "admin") return true;
  const full = `${user.firstName || ""} ${user.lastName || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const compact = full.replace(/\s+/g, "");
  const isAlain = full.includes("alain");
  const isVanGyzel =
    full.includes("van gyzel") || compact.includes("vangyzel") || full.includes("gyzel");
  return isAlain && isVanGyzel;
}

async function removeUser(user) {
  const paid = await prisma.payment.findFirst({
    where: { userId: user.id, status: "paid" },
    select: { id: true },
  });

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await prisma.pushDevice.deleteMany({ where: { userId: user.id } }).catch(() => null);
  await prisma.noticeRead.deleteMany({ where: { userId: user.id } }).catch(() => null);

  if (paid) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        blocked: true,
        email: `deleted-${user.id.slice(0, 8)}@deleted.local`,
        firstName: null,
        lastName: null,
        phone: null,
        phoneNormalized: null,
        address: null,
        companyName: null,
        vatNumber: null,
      },
    });
    console.log(`anonymized paid user ${user.email}`);
    return;
  }

  await prisma.referral.deleteMany({
    where: { OR: [{ referrerId: user.id }, { referredUserId: user.id }] },
  });
  await prisma.pointsTransaction.deleteMany({ where: { userId: user.id } });
  await prisma.prizeEntry.deleteMany({ where: { userId: user.id } });
  await prisma.legalAcceptance.deleteMany({ where: { userId: user.id } });
  await prisma.payment.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  console.log(`deleted user ${user.email}`);
}

async function main() {
  const done = await prisma.siteContent.findUnique({ where: { key: FLAG } });
  if (done?.value === "1") {
    console.log("launch cleanup already done — skip");
    return;
  }

  const startDate = new Date("2026-09-09T00:00:00+02:00");
  const endDate = new Date("2026-10-31T23:59:59+02:00");

  const campaign = await prisma.campaign.findFirst({ where: { slug: "myurusdream" } });
  if (!campaign) throw new Error("Campaign myurusdream not found");

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

  await prisma.siteContent.upsert({
    where: { key: FLAG },
    update: { value: "1" },
    create: { key: FLAG, value: "1" },
  });

  console.log(`launch cleanup finished — kept ${kept}, removed ${removed}`);
}

main()
  .catch((error) => {
    console.error("launch cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
