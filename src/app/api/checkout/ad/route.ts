import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCampaign } from "@/lib/campaign";
import { paymentsAllowed } from "@/lib/flags";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { looksSuspiciousEmail, tooManyFromIp, flagFraud } from "@/lib/fraud";
import { getMollie, mollieConfigured, siteUrl } from "@/lib/mollie";
import { audit } from "@/lib/audit";
import { ensurePayerUser, occupiedPixels, recordLegalAcceptances } from "@/lib/ad-users";
import { fulfillPaidPayment } from "@/lib/payments";
import { createUserSession } from "@/lib/auth";
import { isSafePixelImageUrl } from "@/lib/pixel-image";
import { SITE_NAME } from "@/lib/constants";
import { normalizeWebsiteUrl } from "@/lib/website";
import {
  fitsOnGrid,
  pixelOverlapsTitleReserve,
  pixelPackage,
  pixelPriceCents,
  rectsOverlap,
  SPONSOR_MIN_CENTS,
  tierForAmount,
  validPixelSize,
} from "@/lib/sponsors";

const schema = z.object({
  kind: z.enum(["sponsor", "pixel"]),
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  company: z.string().min(1).max(80),
  url: z.string().max(200).optional(),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  acceptCampaign: z.literal(true),
  amountCents: z.number().int().optional(),
  pixelPackageId: z.string().optional(),
  pixelX: z.number().int().optional(),
  pixelY: z.number().int().optional(),
  pixelW: z.number().int().optional(),
  pixelH: z.number().int().optional(),
  pixelColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  pixelLabel: z.string().max(80).optional(),
  pixelImage: z.string().max(220).optional(),
  phone: z.string().max(24).optional(),
  vatNumber: z.string().max(32).optional(),
  invoiceCompany: z.string().max(80).optional(),
  address: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    return await handleAdCheckout(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Er ging iets mis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function checkoutFieldError(error: z.ZodError) {
  const field = String(error.issues[0]?.path[0] || "");
  const messages: Record<string, string> = {
    email: "Vul een geldig e-mailadres in.",
    firstName: "Vul uw voornaam in.",
    lastName: "Vul uw achternaam in.",
    company: "Vul een bedrijfsnaam of titel in.",
    url: "Vul een geldige website in, bijvoorbeeld www.bakkerij.be",
    acceptTerms: "Aanvaard de voorwaarden om verder te gaan.",
    acceptPrivacy: "Aanvaard de voorwaarden om verder te gaan.",
    acceptCampaign: "Aanvaard de voorwaarden om verder te gaan.",
    amountCents: "Kies een geldig bedrag.",
  };
  return messages[field] || "Controleer de velden en de verplichte vinkjes.";
}

async function handleAdCheckout(req: Request) {
  const ip = clientIp(req.headers);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: checkoutFieldError(parsed.error) }, { status: 400 });
  }

  if (mollieConfigured()) {
    const limited = rateLimit(`checkout-ad:${ip}`, 20, 10 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
    }
  }

  const campaign = await getCampaign();
  const gate = paymentsAllowed(campaign);
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const firstName = parsed.data.firstName.trim();
  const lastName = parsed.data.lastName?.trim() || null;
  const phone = parsed.data.phone?.trim() || null;
  const vatNumber = parsed.data.vatNumber?.trim() || null;
  const invoiceCompany = parsed.data.invoiceCompany?.trim() || null;
  const address = parsed.data.address?.trim() || null;
  const company = parsed.data.company.trim();
  const rawUrl = parsed.data.url?.trim() || "";
  let url: string | null = null;
  if (rawUrl) {
    url = normalizeWebsiteUrl(rawUrl);
    if (!url) {
      return NextResponse.json(
        { error: "Vul een geldige website in, bijvoorbeeld www.bakkerij.be" },
        { status: 400 },
      );
    }
  }

  if (parsed.data.kind === "pixel" || parsed.data.kind === "sponsor") {
    const phoneDigits = (phone || "").replace(/\D/g, "");
    const phoneOk = phoneDigits.length >= 8 && phoneDigits.length <= 15;
    if (!lastName || !phoneOk || !vatNumber || !invoiceCompany || !address) {
      return NextResponse.json(
        { error: "Vul alle factuurgegevens in: naam, gsm, bedrijfsnaam, btw-nummer en adres." },
        { status: 400 },
      );
    }
  }

  if (tooManyFromIp(ip)) {
    await flagFraud({ type: "mass_ip", details: `Veel ad-checkoutpogingen vanaf ${ip}` });
  }
  if (looksSuspiciousEmail(email)) {
    await flagFraud({ type: "email_pattern", details: email });
  }

  const user = await ensurePayerUser({
    email,
    firstName,
    lastName,
    ip,
    phone,
    vatNumber,
    companyName: invoiceCompany,
    address,
  });
  await recordLegalAcceptances(user.id, ip);

  let amountCents = 0;
  let sponsorTier: string | null = null;
  let pixelX: number | null = null;
  let pixelY: number | null = null;
  let pixelW: number | null = null;
  let pixelH: number | null = null;
  let pixelColor: string | null = null;
  let pixelLabel: string | null = null;
  let pixelImage: string | null = null;
  let description = "";

  if (parsed.data.kind === "sponsor") {
    amountCents = parsed.data.amountCents ?? SPONSOR_MIN_CENTS;
    if (amountCents < SPONSOR_MIN_CENTS) {
      return NextResponse.json(
        { error: "Het minimum voor een sponsorplaats is €500." },
        { status: 400 },
      );
    }
    sponsorTier = tierForAmount(amountCents).id;
    description = `${SITE_NAME} — ${tierForAmount(amountCents).name} sponsor ${company}`;
    const image = parsed.data.pixelImage?.trim() || "";
    if (image && !isSafePixelImageUrl(image)) {
      return NextResponse.json({ error: "Ongeldig logo. Upload het bestand opnieuw." }, { status: 400 });
    }
    pixelImage = image || null;
    pixelLabel = parsed.data.pixelLabel?.trim().slice(0, 80) || null;
  } else {
    const pack = parsed.data.pixelPackageId ? pixelPackage(parsed.data.pixelPackageId) : null;
    const w = parsed.data.pixelW ?? pack?.w;
    const h = parsed.data.pixelH ?? pack?.h;
    if (w == null || h == null || !validPixelSize(w, h)) {
      return NextResponse.json({ error: "Kies een pixelpakket." }, { status: 400 });
    }
    const x = parsed.data.pixelX ?? 0;
    const y = parsed.data.pixelY ?? 0;
    if (!fitsOnGrid(x, y, w, h)) {
      return NextResponse.json(
        { error: "Dat vak valt buiten de muur. Kies een andere plek." },
        { status: 400 },
      );
    }
    const occupied = await occupiedPixels(campaign.id);
    const candidate = { x, y, w, h };
    if (occupied.some((o) => rectsOverlap(candidate, o)) || pixelOverlapsTitleReserve(candidate)) {
      return NextResponse.json(
        { error: "Die plek is al ingenomen. Kies een vrij vak." },
        { status: 409 },
      );
    }
    const image = parsed.data.pixelImage?.trim() || "";
    if (image && !isSafePixelImageUrl(image)) {
      return NextResponse.json({ error: "Ongeldig logo. Upload het bestand opnieuw." }, { status: 400 });
    }
    amountCents = pixelPriceCents(w, h);
    pixelX = x;
    pixelY = y;
    pixelW = w;
    pixelH = h;
    pixelColor = parsed.data.pixelColor || "#111111";
    pixelLabel = parsed.data.pixelLabel?.trim().slice(0, 80) || null;
    pixelImage = image || null;
    description = `${SITE_NAME} — pixelmuur ${company}`;
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      campaignId: campaign.id,
      amountCents,
      status: "pending",
      kind: parsed.data.kind,
      sponsorName: company,
      sponsorUrl: url,
      sponsorTier,
      pixelX,
      pixelY,
      pixelW,
      pixelH,
      pixelColor,
      pixelLabel,
      pixelImage,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
    },
  });

  await audit({
    actorId: user.id,
    action: "checkout.ad.started",
    entity: "Payment",
    entityId: payment.id,
    ip,
    meta: { kind: parsed.data.kind, amountCents },
  });

  if (!mollieConfigured()) {
    try {
      await fulfillPaidPayment(payment.id);
      await createUserSession(payment.userId, "participant");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lokale bevestiging mislukte.";
      return NextResponse.json({ error: message }, { status: 500 });
    }
    return NextResponse.json({
      paymentId: payment.id,
      simulate: true,
      redirect:
        parsed.data.kind === "pixel" ? `/koop-pixels?pid=${payment.id}` : `/bedankt?pid=${payment.id}`,
    });
  }

  try {
    const mollie = getMollie();
    const webhook = process.env.MOLLIE_WEBHOOK_URL?.trim();
    const created = await mollie.payments.create({
      amount: { currency: "EUR", value: (amountCents / 100).toFixed(2) },
      description,
      redirectUrl:
        parsed.data.kind === "pixel"
          ? `${siteUrl()}/koop-pixels?pid=${payment.id}`
          : `${siteUrl()}/bedankt?pid=${payment.id}`,
      webhookUrl: webhook || `${siteUrl()}/api/webhooks/mollie`,
      metadata: { paymentId: payment.id, userId: user.id, kind: parsed.data.kind },
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mollieId: created.id },
    });
    return NextResponse.json({
      paymentId: payment.id,
      checkoutUrl: created.getCheckoutUrl(),
      simulate: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mollie-fout";
    return NextResponse.json(
      { error: `Betaling starten mislukt: ${message}` },
      { status: 502 },
    );
  }
}
