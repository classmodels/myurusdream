import { getShareCopy } from "@/lib/share";
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
  const copy = await getShareCopy();
  return (
    <ShareButtons
      referralCode={referralCode}
      shareText={copy.text}
      shareSubject={copy.subject}
      className={className}
      stacked={stacked}
      compact={compact}
      copyLabel={copyLabel}
    />
  );
}
