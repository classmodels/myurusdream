"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getCampaign, type MoneyLine } from "@/lib/campaign";
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
import { randomSecureIndex } from "@/lib/auth";
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
    lines.push({ key, label, cents, ...(note ? { note } : {}), ...(dynamic ? { dynamic: true } : {}) });
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

export async function sendTestMail(formData: FormData) {
  const admin = await requireAdmin();
  const to = String(formData.get("to") || admin.email).trim();
  if (!to) throw new Error("Vul een testadres in.");
  await sendCampaignMail({
    to,
    subject: "Testmail myurusdream.be",
    body: "Dit is een testmail via dezelfde MailProtect-dienst als ModelPort, met het sjabloon van myurusdream.be.",
    vars: { firstName: admin.firstName || "", lastName: admin.lastName || "", email: to },
  });
  await audit({ actorId: admin.id, action: "mail.test", entity: "MailCampaign", meta: { to } });
}

export async function createMailList(formData: FormData) {
  const admin = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Naam van de lijst is verplicht.");
  await prisma.mailList.create({ data: { name } });
  await audit({ actorId: admin.id, action: "mail.list.create", entity: "MailList" });
  revalidateAdmin();
}

export async function importMailList(formData: FormData) {
  const admin = await requireAdmin();
  let listId = String(formData.get("listId") || "").trim();
  const newName = String(formData.get("newName") || "").trim();
  const csv = String(formData.get("csv") || "");
  const rows = parseEmailCsv(csv);
  if (!rows.length) throw new Error("Geen geldige e-mailadressen in de CSV.");
  if (!listId) {
    const list = await prisma.mailList.create({ data: { name: newName || `Lijst ${new Date().toLocaleDateString("nl-BE")}` } });
    listId = list.id;
  }
  let added = 0;
  for (const row of rows) {
    try {
      await prisma.mailContact.create({
        data: { listId, email: row.email, firstName: row.firstName, lastName: row.lastName },
      });
      added += 1;
    } catch {
      /* duplicate */
    }
  }
  await audit({
    actorId: admin.id,
    action: "mail.list.import",
    entity: "MailList",
    entityId: listId,
    meta: { added, total: rows.length },
  });
  revalidateAdmin();
}

export async function sendMailCampaign(formData: FormData) {
  const admin = await requireAdmin();
  const cfg = await getSmtpConfig();
  if (!smtpReady(cfg)) throw new Error("SMTP is nog niet ingesteld.");
  const subject = String(formData.get("subject") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = String(formData.get("audience") || "accounts");
  const manual = String(formData.get("manual") || "");
  if (!subject || !body) throw new Error("Onderwerp en tekst zijn verplicht.");

  type Target = { email: string; firstName: string; lastName: string };
  let targets: Target[] = [];
  if (audience === "accounts") {
    const users = await prisma.user.findMany({
      where: {
        role: "participant",
        blocked: false,
        NOT: { email: { startsWith: "deleted-" } },
      },
      select: { email: true, firstName: true, lastName: true },
    });
    targets = users.map((u) => ({
      email: u.email,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
    }));
  } else if (audience.startsWith("list:")) {
    const listId = audience.slice(5);
    const contacts = await prisma.mailContact.findMany({
      where: { listId, unsubscribed: false },
    });
    targets = contacts.map((c) => ({ email: c.email, firstName: c.firstName, lastName: c.lastName }));
  } else if (audience === "manual") {
    targets = parseEmailCsv(manual.includes("@") && !manual.includes(",") && !manual.includes(";")
      ? manual.split(/\s+/).filter(Boolean).join("\n")
      : manual);
    if (!targets.length) {
      targets = manual
        .split(/[\s,;]+/)
        .map((email) => email.trim().toLowerCase())
        .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        .map((email) => ({ email, firstName: "", lastName: "" }));
    }
  }
  const unique = [...new Map(targets.map((t) => [t.email.toLowerCase(), t])).values()];
  if (!unique.length) throw new Error("Geen ontvangers gevonden.");

  let sentCount = 0;
  let failCount = 0;
  for (const target of unique) {
    try {
      await sendCampaignMail({
        to: target.email,
        subject,
        body,
        vars: { firstName: target.firstName, lastName: target.lastName, email: target.email },
      });
      sentCount += 1;
    } catch {
      failCount += 1;
    }
  }
  await prisma.mailCampaign.create({
    data: { subject, body, audience, sentAt: new Date(), sentCount, failCount },
  });
  await audit({
    actorId: admin.id,
    action: "mail.send",
    entity: "MailCampaign",
    meta: { audience, sentCount, failCount },
  });
  revalidateAdmin();
}
