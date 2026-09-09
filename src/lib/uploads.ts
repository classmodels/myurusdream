import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";

/**
 * Upload root outside the git deploy tree when possible, so Autogit/Combell
 * redeploys do not wipe sponsor logos and challenge videos.
 *
 * Set UPLOAD_DIR in Combell to an absolute path outside the app folder.
 * Default: sibling folder `../myurusdream-uploads` next to the app.
 * If that path is not writable, we fall back to `public/uploads`.
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
  const roots = [uploadsRoot(), publicUploadsFallbackRoot()];
  return [...new Set(roots)];
}

export async function ensureUploadDir(...parts: string[]) {
  let lastErr: unknown;
  for (const root of candidateRoots()) {
    try {
      const dir = path.join(root, ...parts);
      await mkdir(dir, { recursive: true });
      return dir;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Uploadmap kon niet worden aangemaakt.");
}

async function writeToRoot(root: string, folder: string, filename: string, buffer: Buffer) {
  const dir = path.join(root, folder);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, filename);
  await writeFile(full, buffer);
  return full;
}

export async function saveUpload(
  folder: "pixels" | "challenges",
  filename: string,
  buffer: Buffer,
) {
  const roots = candidateRoots();
  let written: string | null = null;
  let lastErr: unknown;

  for (const root of roots) {
    try {
      written = await writeToRoot(root, folder, filename, buffer);
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!written) {
    throw lastErr instanceof Error ? lastErr : new Error("Logo kon niet worden opgeslagen.");
  }

  // Mirror to every other root so /api/media and static /uploads both work.
  for (const root of roots) {
    try {
      await writeToRoot(root, folder, filename, buffer);
    } catch {
      /* best effort */
    }
  }

  return {
    absolutePath: written,
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
  const candidates = candidateRoots().map((root) => path.join(root, ...relativePosix.split("/")));
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
