import { SITE_DOMAIN, SITE_NAME, SHARE_TEXT } from "./constants";
import { siteUrl } from "./mollie";
import { getSetting } from "./settings";

export async function getShareCopy() {
  const text = (await getSetting("share_text"))?.trim() || SHARE_TEXT;
  const subject =
    (await getSetting("share_email_subject"))?.trim() || `${SITE_NAME} — €2 voor een droom`;
  return { text, subject };
}

export function shareUrl(referralCode?: string | null) {
  const base = `${siteUrl()}/meedoen`;
  return referralCode ? `${base}/${encodeURIComponent(referralCode)}` : base;
}

export function prettyShareUrl(referralCode?: string | null) {
  const path = referralCode ? `/meedoen/${encodeURIComponent(referralCode)}` : "/meedoen";
  return `${SITE_DOMAIN}${path}`;
}

export function shareLinks(
  referralCode: string | null | undefined,
  copy: { text: string; subject: string },
) {
  const url = shareUrl(referralCode);
  const text = `${copy.text} ${url}`;
  return {
    url,
    text,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(copy.text)}`,
    email: `mailto:?subject=${encodeURIComponent(copy.subject)}&body=${encodeURIComponent(text)}`,
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
    snapchat: "https://www.snapchat.com/",
  };
}
