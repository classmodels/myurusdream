import { NOT_CHARITY_LINES } from "@/lib/constants";

export function DisclaimerStrip() {
  return (
    <div className="border-y border-yellow/20 bg-yellow text-black">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-1 px-5 py-2 font-display text-xs tracking-[0.16em] md:text-sm">
        {NOT_CHARITY_LINES.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </div>
  );
}
