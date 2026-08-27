import { SITE_NAME, SHARE_TEXT } from "./constants";
import { siteUrl } from "./mollie";

export function shareUrl(referralCode?: string | null) {
  const base = `${siteUrl()}/meedoen`;
  return referralCode ? `${base}?ref=${encodeURIComponent(referralCode)}` : base;
}

export function shareLinks(referralCode?: string | null) {
  const url = shareUrl(referralCode);
  const text = `${SHARE_TEXT} ${url}`;
  return {
    url,
    text,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    messenger: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(`${SITE_NAME} — €2 voor een droom`)}&body=${encodeURIComponent(text)}`,
  };
}
