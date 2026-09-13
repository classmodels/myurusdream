import { prisma } from "../src/lib/prisma";
import { generateReferralCode, nextParticipantNumber } from "../src/lib/auth";
import { fulfillPaidPayment } from "../src/lib/payments";
import { normalizePhone } from "../src/lib/phone";
import { CAMPAIGN_SLUG } from "../src/lib/constants";

async function ensureParticipant(opts: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode: string;
}) {
  const phoneNormalized = normalizePhone(opts.phone);
  const campaign = await prisma.campaign.findUnique({ where: { slug: CAMPAIGN_SLUG } });
  if (!campaign) throw new Error("Geen campagne gevonden. Run eerst db:seed.");

  let user = await prisma.user.findUnique({ where: { email: opts.email } });
  if (!user) {
    const codeTaken = await prisma.user.findUnique({ where: { referralCode: opts.referralCode } });
    user = await prisma.user.create({
      data: {
        email: opts.email,
        firstName: opts.firstName,
        lastName: opts.lastName,
        phone: opts.phone,
        phoneNormalized,
        participantNumber: await nextParticipantNumber(),
        referralCode: codeTaken ? generateReferralCode() : opts.referralCode,
        role: "participant",
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: opts.phone,
        phoneNormalized,
        firstName: opts.firstName,
        lastName: opts.lastName,
      },
    });
  }

  const paid = await prisma.payment.findFirst({
    where: { userId: user.id, status: "paid", kind: "contribution" },
  });
  if (!paid) {
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        amountCents: campaign.contributionCents || 200,
        status: "pending",
        kind: "contribution",
        method: "dev_seed",
      },
    });
    await fulfillPaidPayment(payment.id);
  }

  return { email: user.email, phone: opts.phone };
}

async function main() {
  const a = await ensureParticipant({
    email: "demo@myurusdream.local",
    firstName: "Demo",
    lastName: "Deelnemer",
    phone: "0470 12 34 56",
    referralCode: "demodemo",
  });
  const b = await ensureParticipant({
    email: "vriend@myurusdream.local",
    firstName: "Vriend",
    lastName: "Tester",
    phone: "0470 65 43 21",
    referralCode: "vriend01",
  });

  console.log("\nDeelnemersdashboard — geen wachtwoord, wel e-mail + gsm:\n");
  console.log(`  ${a.email}`);
  console.log(`  gsm: ${a.phone}`);
  console.log(`\n  ${b.email}`);
  console.log(`  gsm: ${b.phone}`);
  console.log("\nOpen http://127.0.0.1:3001/inloggen\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
