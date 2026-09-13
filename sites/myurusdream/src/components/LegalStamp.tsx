import { LEGAL_WATERMARK } from "@/lib/constants";

export function LegalStamp({ className = "" }: { className?: string }) {
  return <span className={`legal-stamp ${className}`}>{LEGAL_WATERMARK}</span>;
}
