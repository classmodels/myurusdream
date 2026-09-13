import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();

function run(command, args, extraEnv = {}, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function loadSites() {
  const file = path.join(root, "sites.json");
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8"));
}

function sitePrefix(site) {
  const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
  const custom = String(site.basePath || "").replace(/\/$/, "");
  return custom || `/portaal/${slug}`;
}

run("node", [path.join("node_modules", "next", "dist", "bin", "next"), "build"]);

for (const site of loadSites()) {
  const dir = path.resolve(root, site.dir);
  const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
  if (!slug || !existsSync(dir)) {
    console.warn(`Site ${slug || site.dir} ontbreekt, overgeslagen.`);
    continue;
  }
  mkdirSync(dir, { recursive: true });
  const base = sitePrefix(site);
  console.log(`\n→ Build ${base}`);
  run("npm", ["install", "--include=dev"], {}, dir);
  run(
    "node",
    [path.join("node_modules", "next", "dist", "bin", "next"), "build"],
    {
      SITEBUTLER_BASE_PATH: base,
      NEXT_PUBLIC_BASE_PATH: base,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://www.sitebutler.be",
      DATABASE_URL: process.env.DATABASE_URL || "mysql://build:build@127.0.0.1:3306/build",
    },
    dir,
  );
}
