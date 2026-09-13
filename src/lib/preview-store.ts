import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { PreviewFeedback } from "@/lib/preview-model";

function fileFor(slug: string) {
  return path.join(process.cwd(), "public", "uploads", "previews", slug, "feedback.json");
}

export async function readFeedback(slug: string): Promise<PreviewFeedback[]> {
  try {
    const raw = await readFile(fileFor(slug), "utf8");
    const parsed = JSON.parse(raw) as PreviewFeedback[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveFeedback(slug: string, entry: PreviewFeedback) {
  const next = [entry, ...(await readFeedback(slug))].slice(0, 80);
  const file = fileFor(slug);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(next, null, 2), "utf8");
  return next;
}
