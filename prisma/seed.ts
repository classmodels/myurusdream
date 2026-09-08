import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CAMPAIGN_SLUG, DEFAULT_CHECKLIST, GOAL_FAILURE_OPTIONS } from "../src/lib/constants";
import { DEFAULT_FAQS } from "../src/lib/faq";
import { HOME_STORY_PLAIN } from "../src/lib/home-story";
import { EXAMPLE_PIXELS, EXAMPLE_SPONSORS, pixelPriceCents } from "../src/lib/sponsors";

const prisma = new PrismaClient();

const STORY = HOME_STORY_PLAIN;

const MONEY = [
  {
    key: "gross",
    label: "Bruto ontvangen bijdragen",
    cents: 0,
    dynamic: true,
    note: "Som van alle bevestigde betalingen. Geen fictieve cijfers.",
  },
  {
    key: "fees",
    label: "Transactiekosten",
    cents: 0,
    note: "Schatting. Exacte kosten volgen uit de betaalprovider.",
  },
  {
    key: "tax",
    label: "Belastingen indien van toepassing",
    cents: 0,
    note: "Nog te bepalen na fiscale controle.",
  },
  {
    key: "legal",
    label: "Juridische en administratieve kosten",
    cents: 0,
  },
  {
    key: "vehicle",
    label: "Aankoopprijs voertuig (indicatief)",
    cents: 0,
    note: "€400.000 is het brutodoel, niet automatisch de aankoopprijs.",
  },
  { key: "insurance", label: "Verzekering", cents: 0 },
  { key: "registration", label: "Inschrijving", cents: 0 },
  { key: "other", label: "Overige kosten", cents: 0 },
  {
    key: "remainder",
    label: "Resterend bedrag",
    cents: 0,
    dynamic: true,
    note: "Bruto minus de hierboven ingevulde posten.",
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@myurusdream.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "admin" },
    create: {
      email: adminEmail,
      firstName: "Admin",
      participantNumber: 0,
      referralCode: "admin",
      role: "admin",
      passwordHash,
    },
  });

  await prisma.campaign.upsert({
    where: { slug: CAMPAIGN_SLUG },
    update: { name: "myurusdream.be", storyText: STORY },
    create: {
      slug: CAMPAIGN_SLUG,
      name: "myurusdream.be",
      status: "draft",
      goalCents: 40_000_000,
      contributionCents: 200,
      targetContributions: 200_000,
      storyText: STORY,
      organizerEmail: "info@myurusdream.be",
      organizerName: "Nog in te vullen — organisator",
      moneyBreakdownJson: JSON.stringify(MONEY),
      checklistJson: JSON.stringify(DEFAULT_CHECKLIST),
      referralPublicEnabled: true,
      prizeFeatureEnabled: false,
      multiLevelEnabled: true,
      liveMode: false,
      paymentsEnabled: true,
      paymentsPaused: false,
      goalFailureScenario: "B",
      goalFailureText: GOAL_FAILURE_OPTIONS.B,
    },
  });

  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { slug: CAMPAIGN_SLUG },
  });

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      goalFailureScenario: campaign.goalFailureScenario || "B",
      goalFailureText: campaign.goalFailureText || GOAL_FAILURE_OPTIONS.B,
      paymentsEnabled: true,
      paymentsPaused: false,
      referralPublicEnabled: true,
      multiLevelEnabled: true,
      pointsOwnContribution: 5,
      pointsDirectReferral: 2,
      pointsReferredBonus: 0,
      pointsFurtherLevel: 1,
    },
  });

  const updateCount = await prisma.campaignUpdate.count({
    where: { campaignId: campaign.id },
  });
  if (updateCount === 0) {
    await prisma.campaignUpdate.create({
      data: {
        campaignId: campaign.id,
        title: "De site staat klaar. De teller start op nul.",
        body: "Er is nog geen enkele betaling. Wat u ziet (€0 / €400.000) is de echte stand. Er worden geen demo-bedragen getoond.",
        published: true,
      },
    });
  }

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: DEFAULT_FAQS.map((f, i) => ({
        question: f.question,
        answer: f.answer,
        legalReview: f.legal,
        sortOrder: i + 1,
        published: true,
      })),
    });
  } else {
    for (const [i, f] of DEFAULT_FAQS.entries()) {
      const existing = await prisma.faqItem.findFirst({ where: { question: f.question } });
      if (existing) {
        await prisma.faqItem.update({
          where: { id: existing.id },
          data: { answer: f.answer, legalReview: f.legal, published: true, sortOrder: i + 1 },
        });
      } else {
        await prisma.faqItem.create({
          data: {
            question: f.question,
            answer: f.answer,
            legalReview: f.legal,
            sortOrder: i + 1,
            published: true,
          },
        });
      }
    }
  }

  await prisma.faqItem.deleteMany({
    where: { question: "Wanneer worden de 4 winnaars getrokken?" },
  });

  if (process.env.SEED_EXAMPLE_ADS === "true") {
    await seedExampleAds(campaign.id);
    console.log("Seed OK. Admin:", adminEmail);
    console.log("Voorbeeld-sponsors en pixels gezet (SEED_EXAMPLE_ADS=true).");
  } else {
    await removeExampleAds(campaign.id);
    console.log("Seed OK. Admin:", adminEmail);
    console.log("Geen voorbeeld-stortingen. Teller start op echte betalingen.");
  }
}

function slugName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function removeExampleAds(campaignId: string) {
  await prisma.payment.deleteMany({
    where: {
      campaignId,
      user: {
        email: { endsWith: "@myurusdream.local" },
        role: { not: "admin" },
      },
    },
  });
}

async function seedExampleAds(campaignId: string) {
  const last = await prisma.user.findFirst({
    orderBy: { participantNumber: "desc" },
    select: { participantNumber: true },
  });
  let n = last?.participantNumber ?? 0;

  for (const s of EXAMPLE_SPONSORS) {
    const exists = await prisma.payment.findFirst({
      where: { campaignId, kind: "sponsor", sponsorName: s.name, status: "paid" },
    });
    if (exists) continue;
    n += 1;
    const email = `voorbeeld.${slugName(s.name)}@myurusdream.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName: s.name },
      create: {
        email,
        firstName: s.name,
        participantNumber: n,
        referralCode: `sp${n.toString(36)}`,
      },
    });
    await prisma.payment.create({
      data: {
        userId: user.id,
        campaignId,
        amountCents: s.cents,
        status: "paid",
        paidAt: new Date(),
        kind: "sponsor",
        sponsorName: s.name,
        sponsorUrl: s.url,
        sponsorTier: s.tier,
      },
    });
  }

  for (const p of EXAMPLE_PIXELS) {
    const exists = await prisma.payment.findFirst({
      where: { campaignId, kind: "pixel", pixelLabel: p.label, status: "paid" },
    });
    if (exists) {
      await prisma.payment.update({
        where: { id: exists.id },
        data: {
          amountCents: pixelPriceCents(p.w, p.h),
          pixelColor: p.color,
          pixelImage: p.image,
        },
      });
      continue;
    }
    n += 1;
    const email = `pixel.${slugName(p.label)}@myurusdream.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { firstName: p.label },
      create: {
        email,
        firstName: p.label,
        participantNumber: n,
        referralCode: `px${n.toString(36)}`,
      },
    });
    await prisma.payment.create({
      data: {
        userId: user.id,
        campaignId,
        amountCents: pixelPriceCents(p.w, p.h),
        status: "paid",
        paidAt: new Date(),
        kind: "pixel",
        sponsorName: p.label,
        sponsorUrl: p.url,
        pixelX: p.x,
        pixelY: p.y,
        pixelW: p.w,
        pixelH: p.h,
        pixelColor: p.color,
        pixelLabel: p.label,
        pixelImage: p.image,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
