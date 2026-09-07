import { SITE_NAME } from "@/lib/constants";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBody(text: string) {
  return escapeHtml(text)
    .replace(/\r\n|\r/g, "\n")
    .replace(/ {2}/g, " &nbsp;")
    .replace(/\n/g, "<br>");
}

export type MailVars = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

export function applyMailVars(text: string, vars: MailVars) {
  const first = String(vars.firstName || "").trim();
  const last = String(vars.lastName || "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  const map: Record<string, string> = {
    voornaam: first,
    naam: last,
    volledige_naam: full,
    email: String(vars.email || "").trim(),
    aanhef: full ? `Beste ${full}` : "Beste",
  };
  return String(text || "").replace(/\{\{\s*(voornaam|naam|volledige_naam|email|aanhef)\s*\}\}/gi, (_, key) => {
    return map[String(key).toLowerCase()] || "";
  });
}

export function campaignHtml({
  subject,
  body,
  base,
  vars = {},
}: {
  subject: string;
  body: string;
  base: string;
  vars?: MailVars;
}) {
  const filled = applyMailVars(body, vars);
  const safe = formatBody(filled);
  const year = new Date().getFullYear();
  const site = base.replace(/\/$/, "");
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0b;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:100%;background:#111;border:1px solid #ffd100;">
          <tr>
            <td style="padding:22px 28px;background:#000;border-bottom:2px solid #ffd100;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;color:#ffd100;text-transform:uppercase;">${escapeHtml(SITE_NAME)}</p>
              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#ffffff;">€2 voor een droom</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;background:#f7f4ea;color:#1a1a1a;">
              <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:normal;color:#1a1a1a;">${escapeHtml(subject)}</h1>
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1a1a1a;">${safe}</p>
              <p style="margin:28px 0 0;">
                <a href="${site}" style="display:inline-block;background:#ffd100;color:#111;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;padding:12px 18px;">Naar de site</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#000;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:rgba(255,255,255,0.55);">
                U ontvangt deze mail via ${escapeHtml(SITE_NAME)}. Geen abonnement. © ${year}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
