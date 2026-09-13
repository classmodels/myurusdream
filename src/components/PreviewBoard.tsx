"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PreviewCard } from "@/lib/preview-model";

export function PreviewBoard() {
  const [projects, setProjects] = useState<PreviewCard[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/preview")
      .then((r) => r.json())
      .then((data: { projects?: PreviewCard[] }) => setProjects(data.projects || []))
      .catch(() => setError("Lijst laden mislukte."));
  }, []);

  return (
    <>
      {error && <p className="mb-4 text-sm text-coral">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <article key={p.slug} className="card p-6">
            <p className="text-xs font-bold tracking-wide text-blue-deep uppercase">{p.clientLabel}</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-on-light">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-muted-on-light">{p.summary}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dbe4f0]">
              <div className="h-full rounded-full bg-blue" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-bold text-teal-deep">{p.progress}% · toegangscode vereist</p>
            <Link
              href={p.publicSlug ? `/portaal/${p.publicSlug}` : `/voortgang/${p.slug}`}
              className="btn-primary mt-5 inline-flex text-sm"
            >
              Preview openen
            </Link>
          </article>
        ))}
      </div>
      {projects.length === 0 && !error && (
        <p className="text-sm text-ink-soft">Nog geen projecten in de lijst.</p>
      )}
    </>
  );
}
