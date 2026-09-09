import { prisma } from "./prisma";
import { generateReferralCode, nextParticipantNumber } from "./auth";
import { LEGAL_DOC_VERSION } from "./constants";
import { EXAMPLE_PIXELS, isExampleSponsor, SPONSOR_MIN_CENTS, withoutTitleReserveAds, type OccupiedPixel } from "./sponsors";
import { normalizePhone } from "./phone";

export async function ensurePayerUser(input: {
  email: string;
  firstName: string;
  lastName: string | null;
  ip: string;
  phone?: string | null;
  vatNumber?: string | null;
  companyName?: string | null;
  address?: string | null;
}) {
  const phoneNormalized = input.phone ? normalizePhone(input.phone) : "";
  const billing = {
    ...(input.phone ? { phone: input.phone, phoneNormalized: phoneNormalized || null } : {}),
    ...(input.vatNumber ? { vatNumber: input.vatNumber } : {}),
    ...(input.companyName ? { companyName: input.companyName } : {}),
    ...(input.address ? { address: input.address } : {}),
  };
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        lastIp: input.ip,
        ...billing,
      },
    });
    return existing;
  }
  return prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      participantNumber: await nextParticipantNumber(),
      referralCode: generateReferralCode(),
      lastIp: input.ip,
      ...billing,
    },
  });
}

export async function recordLegalAcceptances(userId: string, ip: string) {
  for (const document of ["terms", "privacy", "campaign"] as const) {
    await prisma.legalAcceptance.create({
      data: {
        userId,
        document,
        version: LEGAL_DOC_VERSION,
        ip,
      },
    });
  }
}

export async function occupiedPixels(campaignId: string): Promise<OccupiedPixel[]> {
  const paid = await prisma.payment.findMany({
    where: { campaignId, status: "paid", kind: "pixel" },
    select: {
      pixelX: true,
      pixelY: true,
      pixelW: true,
      pixelH: true,
      pixelLabel: true,
      pixelColor: true,
      pixelImage: true,
      sponsorName: true,
      sponsorUrl: true,
    },
  });
  return withoutTitleReserveAds(
    paid
    .filter((p) => p.pixelX != null && p.pixelY != null && p.pixelW && p.pixelH)
    .map((p) => {
      const title = p.sponsorName || p.pixelLabel || "Pixel";
      const caption =
        p.pixelLabel && p.pixelLabel !== p.sponsorName ? p.pixelLabel : null;
      const example = EXAMPLE_PIXELS.find(
        (e) => e.label === p.sponsorName || e.label === p.pixelLabel,
      );
      return {
        x: p.pixelX as number,
        y: p.pixelY as number,
        w: p.pixelW as number,
        h: p.pixelH as number,
        label: title,
        caption: caption || example?.caption || null,
        color: p.pixelColor || "#d4ab7e",
        url: p.sponsorUrl,
        image: example?.image || p.pixelImage || null,
      };
    }),
  );
}

export async function paidSponsors(campaignId: string) {
  return prisma.payment.findMany({
    where: { campaignId, status: "paid", kind: "sponsor" },
    orderBy: { amountCents: "desc" },
    select: {
      id: true,
      amountCents: true,
      sponsorName: true,
      sponsorUrl: true,
      sponsorTier: true,
      pixelImage: true,
      pixelLabel: true,
      paidAt: true,
    },
  });
}

export async function displaySponsorCards(campaignId: string) {
  const live = await paidSponsors(campaignId);
  return live
    .filter((s) => s.sponsorName)
    .filter((s) => s.sponsorTier !== "starter" && s.amountCents >= SPONSOR_MIN_CENTS)
    .map((s) => ({
      id: s.id,
      name: s.sponsorName as string,
      url: s.sponsorUrl,
      tier: s.sponsorTier || "bronze",
      cents: s.amountCents,
      tagline: s.pixelLabel || undefined,
      logo: s.pixelImage || null,
    }))
    .filter((s) => !isExampleSponsor(s.name))
    .sort((a, b) => b.cents - a.cents);
}
