import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LiveClientWebsite } from "@/components/LiveClientWebsite";
import { listHostedSites } from "@/lib/hosted-sites";
import { RESERVED_PUBLIC_SLUGS, previewPublic } from "@/lib/preview-model";
import { getPreviewByPublicSlug } from "@/lib/previews";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_PUBLIC_SLUGS.has(slug)) return {};
  const hosted = listHostedSites().find((s) => s.slug === slug);
  if (hosted) return { title: slug };
  const project = await getPreviewByPublicSlug(slug);
  if (!project || project.published === false) {
    return { title: "Niet gevonden" };
  }
  return {
    title: project.title,
    description: project.summary || project.tagline || undefined,
    robots: { index: false, follow: false },
  };
}

export default async function LiveSitePage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED_PUBLIC_SLUGS.has(slug)) notFound();

  const hosted = listHostedSites().find((s) => s.slug === slug);
  if (hosted) redirect(hosted.basePath);

  const project = await getPreviewByPublicSlug(slug);
  if (!project || (project.slot && project.published !== true) || project.published === false) {
    notFound();
  }

  return <LiveClientWebsite project={previewPublic(project)} />;
}
