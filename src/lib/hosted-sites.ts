import { existsSync, readFileSync } from "fs";
import path from "path";

export type HostedSite = {
  slug: string;
  dir: string;
  basePath: string;
};

export function listHostedSites(): HostedSite[] {
  const file = path.join(process.cwd(), "sites.json");
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as Array<{
      slug?: string;
      dir?: string;
      basePath?: string;
    }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        const slug = String(row.slug || "")
          .replace(/^\/+|\/+$/g, "")
          .toLowerCase();
        if (!slug) return null;
        const basePath = String(row.basePath || "").replace(/\/$/, "") || `/portaal/${slug}`;
        return { slug, dir: String(row.dir || `sites/${slug}`), basePath };
      })
      .filter((row): row is HostedSite => Boolean(row));
  } catch {
    return [];
  }
}

export function hostedPathForSlug(slug: string) {
  const site = listHostedSites().find((s) => s.slug === slug);
  return site?.basePath || `/portaal/${slug}`;
}
