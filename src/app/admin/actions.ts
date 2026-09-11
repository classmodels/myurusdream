"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getCampaign, parseMoneyBreakdown, type MoneyLine } from "@/lib/campaign";
import { canSwitchLive, parseChecklist } from "@/lib/flags";
import { revalidateAdmin } from "@/lib/admin";
import { getSmtpConfig, parseEmailCsv, saveSmtpConfig, sendCampaignMail, smtpReady } from "@/lib/mail";
import {
  CHECKLIST_LABELS,
  DEFAULT_CHECKLIST,
  GOAL_FAILURE_OPTIONS,
  type ChecklistKey,
  type GoalFailureScenario,
} from "@/lib/constants";
import { audit } from "@/lib/audit";
import { hashEntries, fulfillPaidPayment } from "@/lib/payments";
import { randomSecureIndex, generateReferralCode, nextParticipantNumber } from "@/lib/auth";
import { tierForAmount } from "@/lib/sponsors";
import { normalizeWebsiteUrl } from "@/lib/website";
import { randomBytes } from "crypto";
import { encryptSecret } from "@/lib/secret-box";
import { getSetting, setSetting } from "@/lib/settings";
import { isMollieKey, siteUrl } from "@/lib/mollie";
import { notifyEveryone } from "@/lib/notify";

async function requireAdmin() {
  const user = await getSessionUser("admin");
  if (!user) throw new Error("Niet ingelogd als admin.");
  return user;
}

export async function setGoalFailure(formData: FormData) {
  const admin = await requireAdmin();
  const scenario = String(formData.get("scenario") || "") as GoalFailureScenario;
  if (!GOAL_FAILURE_OPTIONS[scenario]) throw new Error("Ongeldig scenario.");
  const extra = String(formData.get("extra") || "").trim();
  const campaign = await getCampaign();
  const text =
    scenario === "C" && extra
      ? extra
      : GOAL_FAILURE_OPTIONS[scenario];
  const checklist = parseChecklist(campaign.checklistJson);
  checklist.goalFailureSet = true;
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      goalFailureScenario: scenario,
      goalFailureText: text,
      checklistJson: JSON.stringify(checklist),
    },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.goal_failure",
    entity: "Campaign",
    entityId: campaign.id,
    meta: { scenario },
  });
  revalidateAdmin();
  revalidatePath("/meedoen");
}

export async function togglePaymentsPaused() {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { paymentsPaused: !campaign.paymentsPaused },
  });
  await audit({
    actorId: admin.id,
    action: campaign.paymentsPaused ? "payments.resume" : "payments.pause",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidateAdmin();
}

export async function toggleReferralAdmin() {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { referralPublicEnabled: !campaign.referralPublicEnabled },
  });
  await audit({
    actorId: admin.id,
    action: "referral.toggle",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidateAdmin();
  revalidatePath("/");
}

export async function togglePrizeAdmin() {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { prizeFeatureEnabled: !campaign.prizeFeatureEnabled },
  });
  await audit({
    actorId: admin.id,
    action: "prize.toggle",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidateAdmin();
  revalidatePath("/");
}

export async function saveChecklist(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  const next = { ...DEFAULT_CHECKLIST, ...parseChecklist(campaign.checklistJson) };
  (Object.keys(CHECKLIST_LABELS) as ChecklistKey[]).forEach((key) => {
    next[key] = formData.get(key) === "on";
  });
  if (!campaign.goalFailureScenario) next.goalFailureSet = false;
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { checklistJson: JSON.stringify(next) },
  });
  await audit({
    actorId: admin.id,
    action: "checklist.update",
    entity: "Campaign",
    entityId: campaign.id,
    meta: next,
  });
  revalidateAdmin();
}

export async function tryGoLive() {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  if (!canSwitchLive(campaign)) {
    throw new Error("Publicatiecheck is nog niet volledig afgevinkt.");
  }
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { liveMode: true, status: "live" },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.live",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidatePath("/");
  revalidateAdmin();
}

export async function saveMoneyBreakdown(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  const keys = formData.getAll("key").map(String);
  const labels = formData.getAll("label").map(String);
  const euros = formData.getAll("euros").map(String);
  const notes = formData.getAll("note").map(String);
  const dynamics = formData.getAll("dynamic").map(String);
  const deductFees = formData.get("deductFeesOnFrontend") === "on";
  const lines: MoneyLine[] = [];
  for (let i = 0; i < keys.length; i++) {
    const label = (labels[i] || "").trim();
    const key = (keys[i] || "").trim() || `line-${i + 1}`;
    if (!label) continue;
    const dynamic = dynamics[i] === "1";
    const cents = dynamic
      ? 0
      : Math.max(0, Math.round(Number(String(euros[i] || "0").replace(",", ".")) * 100) || 0);
    const note = (notes[i] || "").trim();
    lines.push({
      key,
      label,
      cents,
      ...(note ? { note } : {}),
      ...(dynamic ? { dynamic: true } : {}),
      ...(key === "fees" ? { deductOnFrontend: deductFees } : {}),
    });
  }
  const extraLabel = String(formData.get("newLabel") || "").trim();
  if (extraLabel) {
    const extraKey =
      extraLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `post-${lines.length + 1}`;
    const extraCents = Math.max(
      0,
      Math.round(Number(String(formData.get("newEuros") || "0").replace(",", ".")) * 100) || 0,
    );
    const extraNote = String(formData.get("newNote") || "").trim();
    lines.push({
      key: extraKey,
      label: extraLabel,
      cents: extraCents,
      ...(extraNote ? { note: extraNote } : {}),
    });
  }
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { moneyBreakdownJson: JSON.stringify(lines) },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.money",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidatePath("/");
  revalidatePath("/volg-alles");
  revalidateAdmin();
}

export async function saveTransactionFees(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  const cents = Math.max(
    0,
    Math.round(Number(String(formData.get("euros") || "0").replace(",", ".")) * 100) || 0,
  );
  const deductOnFrontend = formData.get("deductFeesOnFrontend") === "on";
  const lines = parseMoneyBreakdown(campaign.moneyBreakdownJson);
  const idx = lines.findIndex((l) => l.key === "fees");
  const next: MoneyLine = {
    key: "fees",
    label: idx >= 0 ? lines[idx].label : "Transactiekosten",
    cents,
    deductOnFrontend,
    ...(idx >= 0 && lines[idx].note ? { note: lines[idx].note } : {}),
  };
  if (idx >= 0) lines[idx] = { ...lines[idx], ...next };
  else lines.push(next);
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { moneyBreakdownJson: JSON.stringify(lines) },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.fees",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidatePath("/");
  revalidatePath("/volg-alles");
  revalidatePath("/pixels");
  revalidateAdmin();
}

export async function saveOrganizer(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      organizerName: String(formData.get("organizerName") || ""),
      organizerEmail: String(formData.get("organizerEmail") || ""),
      organizerAddress: String(formData.get("organizerAddress") || ""),
      organizerCompany: String(formData.get("organizerCompany") || ""),
      vatNumber: String(formData.get("vatNumber") || ""),
      storyText: String(formData.get("storyText") || ""),
    },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.organizer",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidateAdmin();
  revalidatePath("/contact");
  revalidatePath("/");
}

export async function savePointsConfig(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      pointsOwnContribution: Number(formData.get("pointsOwnContribution") || 5),
      pointsDirectReferral: Number(formData.get("pointsDirectReferral") || 2),
      pointsReferredBonus: Number(formData.get("pointsReferredBonus") || 0),
      pointsFurtherLevel: Number(formData.get("pointsFurtherLevel") || 1),
    },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.points",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidateAdmin();
}

export async function createUpdate(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  await prisma.campaignUpdate.create({
    data: {
      campaignId: campaign.id,
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      published: formData.get("published") === "on",
    },
  });
  await audit({
    actorId: admin.id,
    action: "update.create",
    entity: "CampaignUpdate",
  });
  revalidatePath("/");
  revalidatePath("/volg-alles");
  revalidateAdmin();
}

export async function saveFaq(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.faqItem.update({
    where: { id },
    data: {
      question: String(formData.get("question") || ""),
      answer: String(formData.get("answer") || ""),
      published: formData.get("published") === "on",
    },
  });
  await audit({ actorId: admin.id, action: "faq.update", entity: "FaqItem", entityId: String(id) });
  revalidatePath("/faq");
  revalidatePath("/");
  revalidateAdmin();
}

export async function blockUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "admin") throw new Error("Ongeldige gebruiker.");
  await prisma.user.update({ where: { id }, data: { blocked: !user.blocked } });
  await audit({
    actorId: admin.id,
    action: user.blocked ? "user.unblock" : "user.block",
    entity: "User",
    entityId: id,
  });
  revalidateAdmin();
}

export async function reviewFraud(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "reviewed");
  await prisma.fraudFlag.update({ where: { id }, data: { status } });
  await audit({
    actorId: admin.id,
    action: "fraud.review",
    entity: "FraudFlag",
    entityId: id,
    meta: { status },
  });
  revalidateAdmin();
}

export async function lockAndDraw(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  const type = String(formData.get("type") || "luck");
  const entries = await prisma.prizeEntry.findMany({
    where: { valid: true, payment: { status: "paid", campaignId: campaign.id } },
    orderBy: { entryNumber: "asc" },
  });
  if (entries.length === 0) throw new Error("Geen geldige deelnemers.");
  const hash = hashEntries(entries.map((e) => e.entryNumber));
  const index = randomSecureIndex(entries.length);
  const winner = entries[index];
  const seed = hash.slice(0, 16);
  await prisma.draw.create({
    data: {
      campaignId: campaign.id,
      type,
      status: "drawn",
      participantHash: hash,
      lockedAt: new Date(),
      drawnAt: new Date(),
      randomSeed: seed,
      winnerId: winner.userId,
      validEntryCount: entries.length,
      auditJson: JSON.stringify({
        index,
        entryNumber: winner.entryNumber,
        note: "Admin-trekking. Publiek pas tonen na juridische goedkeuring.",
      }),
    },
  });
  await audit({
    actorId: admin.id,
    action: "draw.execute",
    entity: "Draw",
    meta: { winnerId: winner.userId, count: entries.length },
  });
  revalidateAdmin();
}

export async function markSimulatePaid(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("paymentId") || "");
  await fulfillPaidPayment(id);
  await audit({
    actorId: admin.id,
    action: "payment.manual_paid",
    entity: "Payment",
    entityId: id,
  });
  revalidateAdmin();
}

export async function saveMollie(formData: FormData) {
  const admin = await requireAdmin();
  const key = String(formData.get("apiKey") || "").trim();
  const webhook = String(formData.get("webhookUrl") || "").trim();
  if (key) {
    if (!isMollieKey(key)) {
      throw new Error("Sleutel moet beginnen met test_ of live_");
    }
    await setSetting("mollie_api_key", encryptSecret(key));
  }
  await setSetting("mollie_webhook_url", webhook || `${siteUrl()}/api/webhooks/mollie`);
  await audit({
    actorId: admin.id,
    action: "mollie.settings",
    entity: "SiteContent",
    meta: { hasKey: Boolean(key || (await getSetting("mollie_api_key"))) },
  });
  revalidateAdmin();
  revalidatePath("/meedoen");
}

export async function sendBroadcast(formData: FormData) {
  const admin = await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const url = String(formData.get("url") || "/").trim() || "/";
  if (!title || !body) throw new Error("Titel en tekst zijn verplicht.");
  await notifyEveryone({ title, body, url });
  await audit({
    actorId: admin.id,
    action: "notice.broadcast",
    entity: "Notice",
    meta: { title },
  });
  revalidateAdmin();
}

export async function saveShareCopy(formData: FormData) {
  const admin = await requireAdmin();
  const text = String(formData.get("text") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  if (text.length < 10) throw new Error("Deeltekst is te kort.");
  await setSetting("share_text", text);
  await setSetting("share_email_subject", subject || "myurusdream.be — €2 voor een droom");
  await audit({ actorId: admin.id, action: "share.copy", entity: "SiteContent" });
  revalidateAdmin();
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/bedankt");
}

export async function createFaq(formData: FormData) {
  const admin = await requireAdmin();
  const question = String(formData.get("question") || "").trim();
  const answer = String(formData.get("answer") || "").trim();
  if (!question || !answer) throw new Error("Vraag en antwoord zijn verplicht.");
  const last = await prisma.faqItem.findFirst({ orderBy: { sortOrder: "desc" } });
  await prisma.faqItem.create({
    data: {
      question,
      answer,
      published: formData.get("published") === "on",
      sortOrder: (last?.sortOrder ?? 0) + 1,
    },
  });
  await audit({ actorId: admin.id, action: "faq.create", entity: "FaqItem" });
  revalidatePath("/faq");
  revalidatePath("/");
  revalidateAdmin();
}

export async function deleteFaq(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  await prisma.faqItem.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "faq.delete", entity: "FaqItem", entityId: String(id) });
  revalidatePath("/faq");
  revalidatePath("/");
  revalidateAdmin();
}

export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("userId") || "");
  const user = await prisma.user.findUnique({
    where: { id },
    include: { payments: { where: { status: "paid" }, take: 1 } },
  });
  if (!user || user.role === "admin") throw new Error("Ongeldige gebruiker.");
  await prisma.session.deleteMany({ where: { userId: id } });
  if (user.payments.length) {
    await prisma.user.update({
      where: { id },
      data: {
        blocked: true,
        email: `deleted-${id.slice(0, 8)}@deleted.local`,
        firstName: null,
        lastName: null,
        phone: null,
        phoneNormalized: null,
        address: null,
      },
    });
  } else {
    await prisma.referral.deleteMany({ where: { OR: [{ referrerId: id }, { referredUserId: id }] } });
    await prisma.pointsTransaction.deleteMany({ where: { userId: id } });
    await prisma.prizeEntry.deleteMany({ where: { userId: id } });
    await prisma.legalAcceptance.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
  }
  await audit({ actorId: admin.id, action: "user.delete", entity: "User", entityId: id });
  revalidateAdmin();
}

export async function saveSmtp(formData: FormData) {
  const admin = await requireAdmin();
  await saveSmtpConfig({
    host: String(formData.get("host") || ""),
    port: String(formData.get("port") || "587"),
    user: String(formData.get("user") || ""),
    pass: String(formData.get("pass") || ""),
    from: String(formData.get("from") || ""),
  });
  await audit({ actorId: admin.id, action: "smtp.settings", entity: "SiteContent" });
  revalidateAdmin();
}

export type TestMailState = { ok?: string; error?: string };
export type ManualPaymentState = { ok?: string; error?: string };

/** Admin: sponsor of bijdrage toevoegen zonder Mollie (meteen als betaald). */
export async function createManualPayment(
  _prev: ManualPaymentState,
  formData: FormData,
): Promise<ManualPaymentState> {
  try {
    const admin = await requireAdmin();
    const kindRaw = String(formData.get("kind") || "sponsor");
    const kind = kindRaw === "contribution" ? "contribution" : "sponsor";
    const name = String(formData.get("name") || "").trim().slice(0, 80);
    const eurosRaw = String(formData.get("amount") || "").trim().replace(",", ".");
    const amountCents = Math.round(Number(eurosRaw) * 100);
    const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
    const urlRaw = String(formData.get("url") || "").trim();

    if (!name) return { error: "Naam is verplicht." };
    if (!Number.isFinite(amountCents) || amountCents < 1) {
      return { error: "Vul een geldig bedrag in (minstens €0,01)." };
    }

    const campaign = await getCampaign();
    let email = emailRaw;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: "Ongeldig e-mailadres." };
    }
    if (!email) {
      email = `manual-${Date.now()}-${randomBytes(3).toString("hex")}@myurusdream.local`;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName: name,
          lastName: null,
          companyName: kind === "sponsor" ? name : null,
          participantNumber: await nextParticipantNumber(),
          referralCode: generateReferralCode(),
        },
      });
    } else if (kind === "sponsor") {
      await prisma.user.update({
        where: { id: user.id },
        data: { companyName: name, firstName: user.firstName || name },
      });
    }

    let sponsorUrl: string | null = null;
    let sponsorTier: string | null = null;
    if (kind === "sponsor") {
      sponsorTier = tierForAmount(amountCents).id;
      if (urlRaw) {
        sponsorUrl = normalizeWebsiteUrl(urlRaw);
        if (!sponsorUrl) return { error: "Ongeldige website. Bijv. www.bedrijf.be" };
      }
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        campaignId: campaign.id,
        amountCents,
        status: "pending",
        kind,
        method: "admin_manual",
        sponsorName: kind === "sponsor" ? name : null,
        sponsorUrl,
        sponsorTier,
      },
    });

    await fulfillPaidPayment(payment.id);

    await audit({
      actorId: admin.id,
      action: "payment.manual_create",
      entity: "Payment",
      entityId: payment.id,
      meta: { kind, amountCents, name },
    });

    revalidatePath("/");
    revalidatePath("/volg-alles");
    revalidatePath("/sponsors");
    revalidatePath("/pixels");
    revalidatePath("/dashboard");
    revalidateAdmin();

    const label =
      kind === "sponsor"
        ? `Sponsor «${name}» toegevoegd`
        : `Bijdrage van «${name}» toegevoegd`;
    return { ok: `${label} — ${(amountCents / 100).toFixed(2).replace(".", ",")} €.` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Toevoegen mislukt." };
  }
}

export async function sendTestMail(_prev: TestMailState, formData: FormData): Promise<TestMailState> {
  try {
    const admin = await requireAdmin();
    const to = String(formData.get("to") || "").trim();
    if (!to) return { error: "Vul uw eigen e-mailadres in bij Testmail naar." };
    await sendCampaignMail({
      to,
      subject: "Testmail myurusdream.be",
      body: "Dit is een testmail via Brevo, met het sjabloon van myurusdream.be.",
      vars: { firstName: admin.firstName || "", lastName: admin.lastName || "", email: to },
    });
    await audit({ actorId: admin.id, action: "mail.test", entity: "MailCampaign", meta: { to } });
    return { ok: `Verzonden naar ${to}. Kijk ook in spam.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Verzenden is mislukt." };
  }
}

export async function createMailList(formData: FormData) {
  const admin = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Naam van de lijst is verplicht.");
  const list = await prisma.mailList.create({ data: { name } });
  await audit({ actorId: admin.id, action: "mail.list.create", entity: "MailList", entityId: list.id });
  revalidateAdmin();
  redirect(`/admin/mailen/lijst/${list.id}`);
}

export type ImportMailState = { error?: string };

async function csvTextFromForm(formData: FormData) {
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    return await file.text();
  }
  return String(formData.get("csv") || "");
}

export async function importMailList(_prev: ImportMailState, formData: FormData): Promise<ImportMailState> {
  const admin = await requireAdmin();
  let listId = String(formData.get("listId") || "").trim();
  const newName = String(formData.get("newName") || "").trim();
  const csv = await csvTextFromForm(formData);
  const rows = parseEmailCsv(csv);
  if (!rows.length) {
    return {
      error:
        "Geen geldige e-mailadressen gevonden. Kies een CSV-bestand (email, voornaam, naam of bedrijf).",
    };
  }
  if (!listId) {
    const list = await prisma.mailList.create({
      data: { name: newName || `Lijst ${new Date().toLocaleDateString("nl-BE")}` },
    });
    listId = list.id;
  }
  let added = 0;
  const chunk = 400;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk).map((row) => ({
      listId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      company: row.company,
    }));
    const result = await prisma.mailContact.createMany({ data: slice, skipDuplicates: true });
    added += result.count;
  }
  await audit({
    actorId: admin.id,
    action: "mail.list.import",
    entity: "MailList",
    entityId: listId,
    meta: { added, total: rows.length },
  });
  revalidateAdmin();
  revalidatePath(`/admin/mailen/lijst/${listId}`);
  redirect(`/admin/mailen/lijst/${listId}?imported=${added}&total=${rows.length}`);
}

export type AddContactState = { error?: string; ok?: string };

export async function addMailContact(_prev: AddContactState, formData: FormData): Promise<AddContactState> {
  const admin = await requireAdmin();
  const listId = String(formData.get("listId") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const company = String(formData.get("company") || "").trim();
  if (!listId) return { error: "Lijst ontbreekt." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Vul een geldig e-mailadres in." };
  try {
    await prisma.mailContact.create({
      data: { listId, email, firstName, lastName, company },
    });
  } catch {
    return { error: "Dit adres staat al in de lijst." };
  }
  await audit({
    actorId: admin.id,
    action: "mail.contact.add",
    entity: "MailList",
    entityId: listId,
    meta: { email },
  });
  revalidateAdmin();
  revalidatePath(`/admin/mailen/lijst/${listId}`);
  return { ok: `${email} toegevoegd.` };
}

export async function deleteMailContact(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("contactId") || "");
  const listId = String(formData.get("listId") || "");
  if (!id) throw new Error("Ongeldig adres.");
  await prisma.mailContact.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "mail.contact.delete", entity: "MailContact", entityId: id });
  revalidateAdmin();
  revalidatePath(`/admin/mailen/lijst/${listId}`);
}

export async function sendMailCampaign(formData: FormData) {
  const admin = await requireAdmin();
  const cfg = await getSmtpConfig();
  if (!smtpReady(cfg)) throw new Error("SMTP is nog niet ingesteld.");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!subject || !body) throw new Error("Onderwerp en tekst zijn verplicht.");

  const listIds = formData.getAll("listIds").map(String).filter(Boolean);
  const contactIds = formData.getAll("contactIds").map(String).filter(Boolean);
  const includeAccounts = formData.get("accounts") === "on";
  const fallbackAudience = String(formData.get("audience") || "");

  type Target = { email: string; firstName: string; lastName: string; company: string };
  let targets: Target[] = [];
  const audienceParts: string[] = [];

  if (includeAccounts || fallbackAudience === "accounts") {
    const users = await prisma.user.findMany({
      where: {
        role: "participant",
        blocked: false,
        NOT: { email: { startsWith: "deleted-" } },
      },
      select: { email: true, firstName: true, lastName: true, companyName: true },
    });
    targets.push(
      ...users.map((u) => ({
        email: u.email,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        company: u.companyName || "",
      })),
    );
    audienceParts.push("Alle accounts");
  }

  const resolvedListIds = [...listIds];
  if (fallbackAudience.startsWith("list:")) resolvedListIds.push(fallbackAudience.slice(5));
  const singleListId = String(formData.get("listId") || "").trim();
  if (singleListId) resolvedListIds.push(singleListId);

  if (contactIds.length) {
    const contacts = await prisma.mailContact.findMany({
      where: { id: { in: contactIds }, unsubscribed: false },
    });
    targets.push(
      ...contacts.map((c) => ({
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
      })),
    );
    audienceParts.push(`${contacts.length} geselecteerde adressen`);
  } else if (resolvedListIds.length) {
    const lists = await prisma.mailList.findMany({
      where: { id: { in: [...new Set(resolvedListIds)] } },
      include: { contacts: { where: { unsubscribed: false } } },
    });
    for (const list of lists) {
      targets.push(
        ...list.contacts.map((c) => ({
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          company: c.company,
        })),
      );
      audienceParts.push(list.name);
    }
  }

  const unique = [...new Map(targets.map((t) => [t.email.toLowerCase(), t])).values()];
  if (!unique.length) throw new Error("Geen ontvangers gevonden. Selecteer een lijst of adressen.");

  const campaign = await prisma.mailCampaign.create({
    data: {
      subject,
      body,
      audience: audienceParts.join(" · ") || "lijst",
      sentAt: new Date(),
    },
  });

  let sentCount = 0;
  let failCount = 0;
  for (const target of unique) {
    const token = randomBytes(16).toString("hex");
    const row = await prisma.mailSend.create({
      data: {
        campaignId: campaign.id,
        email: target.email,
        firstName: target.firstName,
        lastName: target.lastName,
        company: target.company,
        token,
        status: "pending",
      },
    });
    try {
      await sendCampaignMail({
        to: target.email,
        subject,
        body,
        vars: {
          firstName: target.firstName,
          lastName: target.lastName,
          email: target.email,
          company: target.company,
        },
        trackToken: token,
      });
      sentCount += 1;
      await prisma.mailSend.update({
        where: { id: row.id },
        data: { status: "sent", sentAt: new Date() },
      });
    } catch (error) {
      failCount += 1;
      await prisma.mailSend.update({
        where: { id: row.id },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Verzenden mislukt",
        },
      });
    }
  }
  await prisma.mailCampaign.update({
    where: { id: campaign.id },
    data: { sentCount, failCount, sentAt: new Date() },
  });
  await audit({
    actorId: admin.id,
    action: "mail.send",
    entity: "MailCampaign",
    entityId: campaign.id,
    meta: { audience: campaign.audience, sentCount, failCount },
  });
  revalidateAdmin();
  revalidatePath(`/admin/mailen/campagne/${campaign.id}`);
  redirect(`/admin/mailen/campagne/${campaign.id}`);
}

export async function deletePayment(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("paymentId") || "");
  if (!id) throw new Error("Ongeldige betaling.");

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new Error("Betaling niet gevonden.");

  const { deleteUploadByPublicUrl } = await import("@/lib/uploads");
  await deleteUploadByPublicUrl(payment.pixelImage);

  await prisma.prizeEntry.deleteMany({ where: { paymentId: id } });
  await prisma.refund.deleteMany({ where: { paymentId: id } });
  await prisma.referral.updateMany({ where: { paymentId: id }, data: { paymentId: null } });
  await prisma.sponsorOutboundClick.deleteMany({ where: { paymentId: id } }).catch(() => null);
  await prisma.pointsTransaction.deleteMany({ where: { paymentId: id } }).catch(() => null);
  await prisma.payment.delete({ where: { id } });

  // If this was a test sponsor-only account, remove the user too.
  const remaining = await prisma.payment.count({ where: { userId: payment.userId } });
  if (remaining === 0) {
    const user = await prisma.user.findUnique({ where: { id: payment.userId } });
    if (user && user.role !== "admin") {
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.legalAcceptance.deleteMany({ where: { userId: user.id } }).catch(() => null);
      await prisma.pushDevice.deleteMany({ where: { userId: user.id } }).catch(() => null);
      await prisma.noticeRead.deleteMany({ where: { userId: user.id } }).catch(() => null);
      await prisma.pointsTransaction.deleteMany({ where: { userId: user.id } }).catch(() => null);
      await prisma.prizeEntry.deleteMany({ where: { userId: user.id } }).catch(() => null);
      await prisma.referral.deleteMany({
        where: { OR: [{ referrerId: user.id }, { referredUserId: user.id }] },
      }).catch(() => null);
      await prisma.challenge
        .deleteMany({
          where: {
            OR: [{ challengerId: user.id }, { challengedId: user.id }, { loserId: user.id }],
          },
        })
        .catch(() => null);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => null);
    }
  }

  await audit({
    actorId: admin.id,
    action: "payment.delete",
    entity: "Payment",
    entityId: id,
    meta: { kind: payment.kind, amountCents: payment.amountCents },
  });
  revalidatePath("/");
  revalidatePath("/volg-alles");
  revalidatePath("/sponsors");
  revalidatePath("/pixels");
  revalidatePath("/admin/sponsors");
  revalidateAdmin();
}

export async function updateSponsorPlacement(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("paymentId") || "");
  if (!id) throw new Error("Ongeldige sponsor.");

  const payment = await prisma.payment.findFirst({
    where: { id, kind: { in: ["sponsor", "pixel"] }, status: "paid" },
  });
  if (!payment) throw new Error("Sponsorplaats niet gevonden.");

  const sponsorName = String(formData.get("sponsorName") || "").trim().slice(0, 80);
  const sponsorUrl = String(formData.get("sponsorUrl") || "").trim().slice(0, 200);
  const pixelLabel = String(formData.get("pixelLabel") || "").trim().slice(0, 80);
  const pixelImage = String(formData.get("pixelImage") || "").trim();
  const clearLogo = String(formData.get("clearLogo") || "") === "1";

  const { isSafePixelImageUrl } = await import("@/lib/pixel-image");
  if (pixelImage && !clearLogo && !isSafePixelImageUrl(pixelImage)) {
    throw new Error("Ongeldig logo. Upload opnieuw via de kies-knop.");
  }

  if (clearLogo || (pixelImage && pixelImage !== payment.pixelImage)) {
    const { deleteUploadByPublicUrl } = await import("@/lib/uploads");
    await deleteUploadByPublicUrl(payment.pixelImage);
  }

  await prisma.payment.update({
    where: { id },
    data: {
      sponsorName: sponsorName || payment.sponsorName,
      sponsorUrl: sponsorUrl || null,
      pixelLabel: pixelLabel || null,
      pixelImage: clearLogo ? null : pixelImage || payment.pixelImage,
    },
  });

  await audit({
    actorId: admin.id,
    action: "sponsor.update",
    entity: "Payment",
    entityId: id,
    meta: { sponsorName, clearLogo },
  });
  revalidatePath("/");
  revalidatePath("/sponsors");
  revalidatePath("/volg-alles");
  revalidatePath("/admin/sponsors");
  revalidateAdmin();
}

export async function deleteMailList(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("listId") || "");
  if (!id) throw new Error("Ongeldige lijst.");
  await prisma.mailList.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "mail.list.delete", entity: "MailList", entityId: id });
  revalidateAdmin();
  revalidatePath("/admin/mailen");
  revalidatePath("/admin/mailen", "layout");
}

export async function deleteMailCampaign(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Ongeldige campagne.");
  await prisma.mailCampaign.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "mail.campaign.delete", entity: "MailCampaign", entityId: id });
  revalidateAdmin();
}

export async function deleteFraudFlag(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Ongeldige flag.");
  await prisma.fraudFlag.delete({ where: { id } });
  await audit({ actorId: admin.id, action: "fraud.delete", entity: "FraudFlag", entityId: id });
  revalidateAdmin();
}
