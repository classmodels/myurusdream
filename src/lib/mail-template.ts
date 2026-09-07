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
<body style="margin:0;padding:0;background:#131417;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#131417;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:100%;background:#131417;">
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <a href="${site}" style="text-decoration:none;">
                <img src="${site}/mail/header.jpg" width="600" alt="MYURUSDREAM — Drive your dream. Steun de droom met €2." style="display:block;width:100%;max-width:600px;height:auto;border:0;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 30px;background:#131417;">
              <h1 style="margin:0 0 18px;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#d4ab7e;">${escapeHtml(subject)}</h1>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.8;color:#ded9cf;">${safe}</p>
              <p style="margin:30px 0 0;">
                <a href="${site}" style="display:inline-block;background:#d4ab7e;color:#16130e;text-decoration:none;font-family:'Montserrat',Arial,Helvetica,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;padding:12px 24px;">Naar de site</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;font-size:0;line-height:0;">
              <a href="${site}" style="text-decoration:none;">
                <img src="${site}/mail/footer.jpg" width="600" alt="Steun de droom met €2 — kleine gift, grote droom. www.myurusdream.be" style="display:block;width:100%;max-width:600px;height:auto;border:0;">
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:14px 28px 4px;background:#131417;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.6;color:#8b867c;">
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
