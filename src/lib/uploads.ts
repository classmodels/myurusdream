import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";

/**
 * Upload root outside the git deploy tree when possible, so Autogit/Combell
 * redeploys do not wipe sponsor logos and challenge videos.
 *
 * Set UPLOAD_DIR in Combell to an absolute path outside the app folder.
 * Default: sibling folder `../myurusdream-uploads` next to the app.
 */
export function uploadsRoot() {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(/*turbopackIgnore: true*/ fromEnv);
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "myurusdream-uploads");
}

export function publicUploadsFallbackRoot() {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");
}

export async function ensureUploadDir(...parts: string[]) {
  const dir = path.join(uploadsRoot(), ...parts);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveUpload(
  folder: "pixels" | "challenges",
  filename: string,
  buffer: Buffer,
) {
  const dir = await ensureUploadDir(folder);
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  // Best-effort local public copy for local/dev without going through /api/media.
  try {
    const pubDir = path.join(publicUploadsFallbackRoot(), folder);
    await mkdir(pubDir, { recursive: true });
    await writeFile(path.join(pubDir, filename), buffer);
  } catch {
    /* ignore — persistent root is source of truth */
  }
  return {
    absolutePath: full,
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
  const candidates = [
    path.join(uploadsRoot(), ...relativePosix.split("/")),
    path.join(publicUploadsFallbackRoot(), ...relativePosix.split("/")),
  ];
  for (const full of candidates) {
    try {
      await access(full, fsConstants.R_OK);
      return await readFile(full);
    } catch {
      /* try next */
    }
  }
  return null;
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
