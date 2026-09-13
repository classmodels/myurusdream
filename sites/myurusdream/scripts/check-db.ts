import { prisma } from "../src/lib/prisma";

async function main() {
  const c = await prisma.campaign.findFirst();
  console.log("db ok", c?.slug ?? "(no campaign)");
}

main()
  .catch((e) => {
    console.error("db fail", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
