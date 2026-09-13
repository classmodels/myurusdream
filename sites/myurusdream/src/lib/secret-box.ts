import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

function keyBytes() {
  return scryptSync(process.env.SESSION_SECRET || "myurusdream-dev-insecure", "myurusdream-box", 32);
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(stored: string) {
  if (!stored.startsWith("enc:")) return stored;
  const parts = stored.split(":");
  if (parts.length !== 4) return stored;
  const iv = Buffer.from(parts[1], "hex");
  const tag = Buffer.from(parts[2], "hex");
  const data = Buffer.from(parts[3], "hex");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function maskSecret(value: string | null) {
  if (!value) return "";
  if (value.length <= 10) return "••••";
  return `${value.slice(0, 5)}••••${value.slice(-4)}`;
}
