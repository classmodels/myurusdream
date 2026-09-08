import { getShareCopy } from "@/lib/share";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { ShareButtons } from "./ShareButtons";

export async function ShareRow({
  referralCode,
  className,
  stacked = false,
  compact = false,
  copyLabel,
}: {
  referralCode?: string | null;
  className?: string;
  stacked?: boolean;
  compact?: boolean;
  copyLabel?: string;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const admin = locale === "nl" ? await getShareCopy() : null;
  return (
    <ShareButtons
      referralCode={referralCode}
      shareText={admin?.text || dict.share.text}
      shareSubject={admin?.subject || dict.share.subject}
      className={className}
      stacked={stacked}
      compact={compact}
      copyLabel={copyLabel}
    />
  );
}
