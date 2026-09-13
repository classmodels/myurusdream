import type { Metadata } from "next";
import { PreviewRoom } from "@/components/PreviewRoom";
import { TEST_SLOT_COUNT, previewProjects, slotSlug } from "@/lib/preview-model";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [
    ...previewProjects.map((p) => ({ slug: p.slug })),
    ...Array.from({ length: TEST_SLOT_COUNT }, (_, i) => ({ slug: slotSlug(i + 1) })),
  ];
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Preview · ${slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function VoortgangProjectPage({ params }: Props) {
  const { slug } = await params;

  return (
    <section className="mesh-hero">
      <div className="container-x py-10 md:py-16">
        <PreviewRoom slug={slug} title="Preview" />
      </div>
    </section>
  );
}
