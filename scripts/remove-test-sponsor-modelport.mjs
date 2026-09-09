/**
 * One-shot: remove test sponsor "Modelport" (and its amount from the live counter).
 * Runs once on Combell serve via FLAG.
 */
import { PrismaClient } from "@prisma/client";

const FLAG = "remove_test_sponsor_modelport_v2";
const prisma = new PrismaClient();

function isTestSponsor(name, email) {
  const n = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const e = String(email || "").toLowerCase();
  return (
    n.includes("modelport") ||
    e.includes("modelport") ||
    n === "test" ||
    n.includes("test sponsor")
  );
}

async function removePayment(payment) {
  const id = payment.id;
  console.log(
    `removing sponsor payment ${id} · ${payment.sponsorName} · ${payment.amountCents}c · ${payment.user.email}`,
  );
  await prisma.sponsorOutboundClick.deleteMany({ where: { paymentId: id } }).catch(() => null);
  await prisma.prizeEntry.deleteMany({ where: { paymentId: id } }).catch(() => null);
  await prisma.refund.deleteMany({ where: { paymentId: id } }).catch(() => null);
  await prisma.referral.updateMany({ where: { paymentId: id }, data: { paymentId: null } }).catch(() => null);
  await prisma.payment.delete({ where: { id } });
}

async function main() {
  const done = await prisma.siteContent.findUnique({ where: { key: FLAG } });
  if (done) {
    console.log(`skip ${FLAG} (already done)`);
    return;
  }

  const payments = await prisma.payment.findMany({
    where: { kind: "sponsor", status: "paid" },
    include: { user: { select: { id: true, email: true } } },
  });

  const targets = payments.filter((p) => isTestSponsor(p.sponsorName, p.user.email));
  if (!targets.length) {
    console.log("no Modelport/test sponsor payments found");
  }

  for (const p of targets) {
    await removePayment(p);
  }

  await prisma.siteContent.upsert({
    where: { key: FLAG },
    update: { value: new Date().toISOString() },
    create: { key: FLAG, value: new Date().toISOString() },
  });
  console.log(`done ${FLAG}: removed ${targets.length} payment(s)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
