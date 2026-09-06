import webpush from "web-push";
import { prisma } from "./prisma";
import { getSetting, setSetting } from "./settings";
import { siteUrl } from "./mollie";

const VAPID_PUBLIC = "vapid_public";
const VAPID_PRIVATE = "vapid_private";

export async function getVapidPublicKey() {
  const keys = await ensureVapidKeys();
  return keys.publicKey;
}

async function ensureVapidKeys() {
  const publicKey = await getSetting(VAPID_PUBLIC);
  const privateKey = await getSetting(VAPID_PRIVATE);
  if (publicKey && privateKey) return { publicKey, privateKey };
  const generated = webpush.generateVAPIDKeys();
  await setSetting(VAPID_PUBLIC, generated.publicKey);
  await setSetting(VAPID_PRIVATE, generated.privateKey);
  return generated;
}

async function configuredWebPush() {
  const keys = await ensureVapidKeys();
  webpush.setVapidDetails("mailto:info@myurusdream.be", keys.publicKey, keys.privateKey);
}

export async function notifyUser(input: {
  userId: string;
  title: string;
  body: string;
  url?: string;
}) {
  try {
    const notice = await prisma.notice.create({
      data: {
        userId: input.userId,
        title: input.title,
        body: input.body,
        url: input.url || "/dashboard",
      },
    });
    const devices = await prisma.pushDevice.findMany({ where: { userId: input.userId } });
    await sendPush(devices, notice.title, notice.body, notice.url, notice.id);
  } catch (err) {
    console.error("notifyUser failed", err);
  }
}

export async function notifyEveryone(input: { title: string; body: string; url?: string }) {
  const notice = await prisma.notice.create({
    data: {
      userId: null,
      title: input.title,
      body: input.body,
      url: input.url || "/",
    },
  });
  const devices = await prisma.pushDevice.findMany();
  await sendPush(devices, notice.title, notice.body, notice.url, notice.id);
  return notice;
}

async function sendPush(
  devices: { id: string; endpoint: string; p256dh: string; auth: string }[],
  title: string,
  body: string,
  url: string | null,
  noticeId: string,
) {
  if (!devices.length) return;
  await configuredWebPush();
  const payload = JSON.stringify({
    title,
    body,
    url: url || "/",
    noticeId,
  });
  await Promise.all(
    devices.map(async (device) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: device.endpoint,
            keys: { p256dh: device.p256dh, auth: device.auth },
          },
          payload,
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushDevice.delete({ where: { id: device.id } }).catch(() => undefined);
        }
      }
    }),
  );
}

export function absoluteNoticeUrl(path: string | null | undefined) {
  const rel = path || "/";
  if (rel.startsWith("http")) return rel;
  return `${siteUrl()}${rel.startsWith("/") ? rel : `/${rel}`}`;
}
