import nodemailer from "nodemailer";
import { decryptSecret, encryptSecret } from "@/lib/secret-box";
import { getSetting, setSetting } from "@/lib/settings";
import { campaignHtml, type MailVars } from "@/lib/mail-template";
import { siteUrl } from "@/lib/mollie";

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const storedPass = await getSetting("smtp_pass");
  let pass = process.env.SMTP_PASS?.trim() || "";
  if (storedPass) {
    try {
      const decoded = decryptSecret(storedPass).trim();
      if (decoded) pass = decoded;
    } catch {
      /* keep env */
    }
  }
  return {
    host: (await getSetting("smtp_host"))?.trim() || process.env.SMTP_HOST?.trim() || "smtp-auth.mailprotect.be",
    port: Number((await getSetting("smtp_port"))?.trim() || process.env.SMTP_PORT || 587) || 587,
    user: (await getSetting("smtp_user"))?.trim() || process.env.SMTP_USER?.trim() || "",
    pass,
    from:
      (await getSetting("smtp_from"))?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      "myurusdream.be <info@myurusdream.be>",
  };
}

export async function saveSmtpConfig(input: {
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
}) {
  await setSetting("smtp_host", input.host.trim() || "smtp-auth.mailprotect.be");
  await setSetting("smtp_port", String(Number(input.port) || 587));
  await setSetting("smtp_user", input.user.trim());
  await setSetting("smtp_from", input.from.trim() || "myurusdream.be <info@myurusdream.be>");
  if (input.pass.trim()) {
    await setSetting("smtp_pass", encryptSecret(input.pass.trim()));
  }
}

export function smtpReady(cfg: SmtpConfig) {
  return Boolean(cfg.host && cfg.user && cfg.pass && cfg.from);
}

function transporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendCampaignMail(options: {
  to: string;
  subject: string;
  body: string;
  vars?: MailVars;
}) {
  const cfg = await getSmtpConfig();
  if (!smtpReady(cfg)) {
    throw new Error("SMTP is nog niet ingesteld. Vul host, gebruiker en wachtwoord in onder Mailen.");
  }
  const html = campaignHtml({
    subject: options.subject,
    body: options.body,
    base: siteUrl(),
    vars: { ...options.vars, email: options.to },
  });
  await transporter(cfg).sendMail({
    from: cfg.from,
    to: options.to,
    subject: options.subject,
    text: options.body,
    html,
  });
}

export function parseEmailCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const first = lines[0].toLowerCase();
  const sep = first.includes(";") ? ";" : ",";
  const split = (row: string) =>
    row.split(sep).map((c) => c.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
  const header = split(first);
  const emailIdx = header.findIndex((c) => /e-?mail/.test(c));
  const firstIdx = header.findIndex((c) => /voornaam|first/.test(c));
  const lastIdx = header.findIndex((c) => /^(naam|last|achternaam)$/.test(c) || c.includes("last name"));
  const hasHeader = emailIdx >= 0;
  const rows = hasHeader ? lines.slice(1) : lines;
  const out: { email: string; firstName: string; lastName: string }[] = [];
  for (const row of rows) {
    const cols = split(row);
    const email = (hasHeader ? cols[emailIdx] : cols[0] || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    out.push({
      email,
      firstName: hasHeader && firstIdx >= 0 ? cols[firstIdx] || "" : "",
      lastName: hasHeader && lastIdx >= 0 ? cols[lastIdx] || "" : "",
    });
  }
  return out;
}
