"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getCampaign } from "@/lib/campaign";
import { canSwitchLive, parseChecklist } from "@/lib/flags";
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
}

export async function saveMoneyBreakdown(formData: FormData) {
  const admin = await requireAdmin();
  const campaign = await getCampaign();
  const raw = String(formData.get("json") || "[]");
  JSON.parse(raw);
  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { moneyBreakdownJson: raw },
  });
  await audit({
    actorId: admin.id,
    action: "campaign.money",
    entity: "Campaign",
    entityId: campaign.id,
  });
  revalidatePath("/");
  revalidatePath("/volg-alles");
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
}
