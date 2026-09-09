import { mkdir, writeFile, readFile, access, unlink } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";
import { prisma } from "@/lib/prisma";

/**
 * Upload root outside the git deploy tree when possible, so Autogit/Combell
 * redeploys do not wipe sponsor logos and challenge videos.
 *
 * Set UPLOAD_DIR in Combell to an absolute path outside the app folder.
 * Default: sibling folder `../myurusdream-uploads` next to the app.
 * Disk is best-effort; MySQL StoredUpload is the source of truth.
 */
export function uploadsRoot() {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(/*turbopackIgnore: true*/ fromEnv);
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "myurusdream-uploads");
}

export function publicUploadsFallbackRoot() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
}

function candidateRoots() {
  return [...new Set([uploadsRoot(), publicUploadsFallbackRoot()])];
}

async function writeToRoot(root: string, folder: string, filename: string, buffer: Buffer) {
  const dir = path.join(root, folder);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  return full;
}

function mimeForFilename(filename: string) {
  return mediaContentType(filename);
}

export async function saveUpload(
  folder: "pixels" | "challenges",
  filename: string,
  buffer: Buffer,
) {
  const key = `${folder}/${filename}`;
  // Source of truth: database (survives Combell Autogit redeploys).
  await prisma.storedUpload.upsert({
    where: { id: key },
    create: { id: key, mime: mimeForFilename(filename), bytes: buffer },
    update: { mime: mimeForFilename(filename), bytes: buffer },
  });

  let written: string | null = null;
  for (const root of candidateRoots()) {
    try {
      written = await writeToRoot(root, folder, filename, buffer);
    } catch {
      /* disk optional */
    }
  }

  return {
    absolutePath: written || key,
    publicUrl: `/api/media/${folder}/${filename}`,
  };
}

export function safeUploadRelative(parts: string[]) {
  if (!parts.length || parts.some((p) => !p || p === "." || p === ".." || p.includes("\0"))) {
    return null;
  }
  if (parts.some((p) => /[^a-zA-Z0-9._-]/.test(p))) return null;
  return parts.join("/");
}

export async function readUpload(relativePosix: string): Promise<Buffer | null> {
  for (const root of candidateRoots()) {
    const full = path.join(root, ...relativePosix.split("/"));
    try {
      await access(full, fsConstants.R_OK);
      return await readFile(full);
    } catch {
      /* try next */
    }
  }

  try {
    const row = await prisma.storedUpload.findUnique({ where: { id: relativePosix } });
    if (row?.bytes) return Buffer.from(row.bytes);
  } catch {
    /* table may not exist yet before db push */
  }
  return null;
}

export async function deleteUploadByRelative(relativePosix: string) {
  for (const root of candidateRoots()) {
    const full = path.join(root, ...relativePosix.split("/"));
    try {
      await unlink(full);
    } catch {
      /* ignore missing */
    }
  }
  try {
    await prisma.storedUpload.delete({ where: { id: relativePosix } });
  } catch {
    /* ignore missing */
  }
}

/** Accepts `/api/media/pixels/x.jpg` or `/uploads/pixels/x.jpg`. */
export async function deleteUploadByPublicUrl(url: string | null | undefined) {
  if (!url) return;
  const cleaned = url.trim().split("?")[0];
  const match = cleaned.match(/^\/(?:api\/media|uploads)\/(pixels|challenges)\/([a-zA-Z0-9._-]+)$/i);
  if (!match) return;
  await deleteUploadByRelative(`${match[1]}/${match[2]}`);
}

export function mediaContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}
