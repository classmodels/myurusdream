import { shareLinks } from "@/lib/share";
import { CopyButton } from "./CopyButton";

export function ShareRow({
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
  const links = shareLinks(referralCode);
  return (
    <div
      className={`${compact ? "share-row-compact" : ""} flex gap-2 ${
        stacked ? "flex-col" : "flex-wrap items-center"
      } ${className ?? (stacked ? "" : "justify-center")}`}
    >
      <a className="btn-yellow" href={links.whatsapp} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <a className="btn-ghost" href={links.facebook} target="_blank" rel="noreferrer">
        Facebook
      </a>
      <a className="btn-ghost" href={links.email}>
        E-mail
      </a>
      <CopyButton url={links.url} label={copyLabel ?? (referralCode ? "Kopieer mijn link" : "Kopieer campagne")} />
    </div>
  );
}
