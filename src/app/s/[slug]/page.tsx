import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviewRoom } from "@/components/PreviewRoom";
import { getPreviewByPublicSlug } from "@/lib/previews";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPreviewByPublicSlug(slug);
  return {
    title: project?.title || "Voorbeeld",
    robots: { index: false, follow: false },
  };
}

export default async function ClientSitePage({ params }: Props) {
  const { slug } = await params;
  const project = await getPreviewByPublicSlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-full bg-[#0a111c]">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-bold tracking-[0.18em] text-teal uppercase">
          sitebutler.be/s/{project.publicSlug || project.slug}
        </p>
        <PreviewRoom slug={project.slug} title={project.title} />
      </section>
    </div>
  );
}
