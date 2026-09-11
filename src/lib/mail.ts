import nodemailer from "nodemailer";
import { decryptSecret, encryptSecret } from "@/lib/secret-box";
import { getSetting, setSetting } from "@/lib/settings";
import { campaignHtml, type MailVars } from "@/lib/mail-template";
import { siteUrl } from "@/lib/mollie";

const BREVO_HOST = "smtp-relay.brevo.com";
const BREVO_USER = "b6d3b2001@smtp-brevo.com";
const BREVO_FROM = "myurusdream.be <info@myurusdream.be>";

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
    host: (await getSetting("smtp_host"))?.trim() || process.env.SMTP_HOST?.trim() || BREVO_HOST,
    port: Number((await getSetting("smtp_port"))?.trim() || process.env.SMTP_PORT || 587) || 587,
    user: (await getSetting("smtp_user"))?.trim() || process.env.SMTP_USER?.trim() || BREVO_USER,
    pass,
    from:
      (await getSetting("smtp_from"))?.trim() ||
      process.env.SMTP_FROM?.trim() ||
      BREVO_FROM,
  };
}

export async function saveSmtpConfig(input: {
  host: string;
  port: string;
  user: string;
  pass: string;
  from: string;
}) {
  await setSetting("smtp_host", input.host.trim() || BREVO_HOST);
  await setSetting("smtp_port", String(Number(input.port) || 587));
  await setSetting("smtp_user", input.user.trim() || BREVO_USER);
  await setSetting("smtp_from", input.from.trim() || BREVO_FROM);
  if (input.pass.trim()) {
    await setSetting("smtp_pass", encryptSecret(input.pass.trim()));
  }
}

export function smtpReady(cfg: SmtpConfig) {
  return Boolean(cfg.host && cfg.user && cfg.pass && cfg.from);
}

function transporter(cfg: SmtpConfig) {
  const secure = cfg.port === 465;
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure,
    requireTLS: !secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
}

export async function sendCampaignMail(options: {
  to: string;
  subject: string;
  body: string;
  vars?: MailVars;
  trackToken?: string;
}) {
  const cfg = await getSmtpConfig();
  if (!smtpReady(cfg)) {
    throw new Error("SMTP is nog niet ingesteld. Vul host, gebruiker en wachtwoord in onder Mailen.");
  }
  const base = siteUrl();
  const track =
    options.trackToken && base
      ? {
          trackOpenUrl: `${base}/api/mail/open/${options.trackToken}`,
          trackClickUrl: `${base}/api/mail/click/${options.trackToken}`,
        }
      : {};
  const html = campaignHtml({
    subject: options.subject,
    body: options.body,
    base,
    vars: { ...options.vars, email: options.to },
    ...track,
  });
  try {
    await transporter(cfg).sendMail({
      from: cfg.from,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html,
    });
  } catch (error) {
    throw new Error(smtpErrorMessage(error));
  }
}

function smtpErrorMessage(error: unknown) {
  const err = error as { message?: string; response?: string; code?: string };
  const text = `${err.message || ""} ${err.response || ""} ${err.code || ""}`;
  if (/EAUTH|Invalid login|535/i.test(text)) {
    return "Brevo weigert de sleutel. Plak de SMTP-sleutel (xsmtpsib-) opnieuw en klik SMTP opslaan.";
  }
  if (/sender|unauthenticated|550|553|relay not permitted/i.test(text)) {
    return "Brevo weigert de afzender. Voeg info@myurusdream.be toe als Sender in Brevo en bevestig de mail.";
  }
  return err.message || "Verzenden via Brevo is mislukt.";
}

export type ParsedMailRow = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
};

function detectSep(header: string) {
  const counts = {
    ";": (header.match(/;/g) || []).length,
    ",": (header.match(/,/g) || []).length,
    "\t": (header.match(/\t/g) || []).length,
  };
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ";") as string;
}

function parseCsvTable(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] || "";
  const sep = detectSep(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === sep) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && src[i + 1] === "\n")) {
      if (ch === "\r") i += 1;
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c)) rows.push(row);
      row = [];
      continue;
    }
    if (ch === "\r") {
      row.push(cell.trim());
      cell = "";
      if (row.some((c) => c)) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c)) rows.push(row);
  return rows;
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

function headerIndex(header: string[], pattern: RegExp) {
  return header.findIndex((c) => pattern.test(c));
}

export function parseEmailCsv(text: string): ParsedMailRow[] {
  const table = parseCsvTable(text);
  if (!table.length) return [];
  const rawHeader = table[0].map((c) => c.toLowerCase());
  let emailIdx = headerIndex(rawHeader, /e-?mail|mailadres|^mail$/);
  const firstIdx = headerIndex(rawHeader, /voornaam|first\s*name|^first$/);
  const lastIdx = headerIndex(rawHeader, /achternaam|last\s*name|^last$|^naam$/);
  const companyIdx = headerIndex(rawHeader, /bedrijf|company|firma|onderneming|organisatie|zaak|bedrijfsnaam/);
  const hasHeader = emailIdx >= 0 || companyIdx >= 0 || firstIdx >= 0 || lastIdx >= 0;
  const data = hasHeader ? table.slice(1) : table;
  if (emailIdx < 0 && hasHeader) {
    /* header without explicit email column — scan first data row */
  }
  const out: ParsedMailRow[] = [];
  const seen = new Set<string>();
  for (const cols of data) {
    let email = "";
    if (emailIdx >= 0) email = (cols[emailIdx] || "").trim().toLowerCase();
    if (!looksLikeEmail(email)) {
      email = (cols.find((c) => looksLikeEmail(c)) || "").trim().toLowerCase();
    }
    if (!looksLikeEmail(email) || seen.has(email)) continue;
    seen.add(email);
    out.push({
      email,
      firstName: firstIdx >= 0 ? cols[firstIdx] || "" : "",
      lastName: lastIdx >= 0 ? cols[lastIdx] || "" : "",
      company: companyIdx >= 0 ? cols[companyIdx] || "" : "",
    });
  }
  return out;
}
