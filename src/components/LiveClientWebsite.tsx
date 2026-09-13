"use client";

import { TestSiteMock } from "@/components/TestSiteMock";
import { isPublicPreview, type PreviewPublic } from "@/lib/preview-model";

export function LiveClientWebsite({ project }: { project: PreviewPublic }) {
  if (isPublicPreview(project.previewUrl || "")) {
    return (
      <iframe
        title={project.title}
        src={project.previewUrl}
        className="h-dvh w-full border-0 bg-white"
      />
    );
  }

  return <TestSiteMock project={project} live />;
}
