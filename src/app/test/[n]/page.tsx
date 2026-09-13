import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewRoom } from "@/components/PreviewRoom";
import { TEST_SLOT_COUNT, slotSlug } from "@/lib/preview-model";

type Props = { params: Promise<{ n: string }> };

export function generateStaticParams() {
  return Array.from({ length: TEST_SLOT_COUNT }, (_, i) => ({ n: String(i + 1) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Testsite ${n}`,
    robots: { index: false, follow: false },
  };
}

export default async function TestSitePage({ params }: Props) {
  const { n } = await params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > TEST_SLOT_COUNT) notFound();

  return (
    <div className="min-h-full bg-[#0a111c]">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-bold tracking-[0.18em] text-teal uppercase">SiteButler testsite {num}</p>
        <PreviewRoom slug={slotSlug(num)} title={`Testsite ${num}`} />
      </section>
    </div>
  );
}
