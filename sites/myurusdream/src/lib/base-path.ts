/** Prefix absolute asset/API paths when the app runs under SiteButler basePath. */
export function withBasePath(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.SITEBUTLER_BASE_PATH || "")
    .trim()
    .replace(/\/$/, "");
  if (!base) return path;
  if (path.startsWith(base + "/") || path === base) return path;
  if (path.startsWith("/")) return `${base}${path}`;
  return `${base}/${path}`;
}
