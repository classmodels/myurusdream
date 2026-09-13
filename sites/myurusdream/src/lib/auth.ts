import { createHash, createHmac, randomBytes, randomInt } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const PARTICIPANT_COOKIE = "myurusdream_session";
const ADMIN_COOKIE = "myurusdream_admin";

function secret() {
  return process.env.SESSION_SECRET || "myurusdream-dev-insecure";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken() {
  return randomBytes(32).toString("hex");
}

export function generateReferralCode() {
  return randomBytes(4).toString("hex");
}

export function generateEntryNumber() {
  return `DO2-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function nextParticipantNumber() {
  const last = await prisma.user.findFirst({
    where: { role: "participant" },
    orderBy: { participantNumber: "desc" },
    select: { participantNumber: true },
  });
  return (last?.participantNumber ?? 0) + 1;
}

export async function createUserSession(
  userId: string,
  kind: "participant" | "admin",
  days = kind === "admin" ? 1 : 365,
) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: { userId, token: hashToken(token), kind, expiresAt },
  });
  const store = await cookies();
  const name = kind === "admin" ? ADMIN_COOKIE : PARTICIPANT_COOKIE;
  store.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function getSessionUser(kind: "participant" | "admin") {
  const store = await cookies();
  const name = kind === "admin" ? ADMIN_COOKIE : PARTICIPANT_COOKIE;
  const token = store.get(name)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || session.kind !== kind) {
    return null;
  }
  if (session.user.blocked) return null;
  return session.user;
}

export async function clearSession(kind: "participant" | "admin") {
  const store = await cookies();
  const name = kind === "admin" ? ADMIN_COOKIE : PARTICIPANT_COOKIE;
  const token = store.get(name)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token: hashToken(token) } });
  }
  store.delete(name);
}

export async function verifyAdminPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "admin" || !user.passwordHash) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export function randomSecureIndex(maxExclusive: number) {
  if (maxExclusive <= 0) throw new Error("empty draw");
  return randomInt(0, maxExclusive);
}

export { PARTICIPANT_COOKIE, ADMIN_COOKIE, sign };
