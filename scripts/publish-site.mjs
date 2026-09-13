import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const [slugArg, sourceArg] = process.argv.slice(2);
if (!slugArg || !sourceArg) {
  console.error("Gebruik: node scripts/publish-site.mjs <sitenaam> <pad-naar-project>");
  console.error("Voorbeeld: node scripts/publish-site.mjs myurusdream /Users/vangyzelalain/Desktop/Myurusdream");
  process.exit(1);
}

const slug = slugArg.replace(/^\/+|\/+$/g, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
const source = path.resolve(sourceArg);
const root = process.cwd();
const dest = path.join(root, "sites", slug);

if (!existsSync(source)) {
  console.error(`Bronmap bestaat niet: ${source}`);
  process.exit(1);
}

mkdirSync(path.dirname(dest), { recursive: true });

const result = spawnSync(
  "rsync",
  [
    "-a",
    "--delete",
    "--exclude",
    "node_modules",
    "--exclude",
    ".next",
    "--exclude",
    ".git",
    "--exclude",
    ".env",
    "--exclude",
    ".env.local",
    "--exclude",
    ".env.production",
    "--exclude",
    "originals-backup",
    "--exclude",
    "dev.db",
    `${source}/`,
    `${dest}/`,
  ],
  { stdio: "inherit" },
);

if (result.status !== 0) process.exit(result.status ?? 1);

const catalogFile = path.join(root, "sites.json");
const catalog = existsSync(catalogFile) ? JSON.parse(readFileSync(catalogFile, "utf8")) : [];
const nextCatalog = [
  ...catalog.filter((row) => row.slug !== slug),
  { slug, dir: `sites/${slug}`, basePath: `/portaal/${slug}` },
];
writeFileSync(catalogFile, `${JSON.stringify(nextCatalog, null, 2)}\n`);

console.log(`\nKlaar. ${slug} staat in ${dest}`);
console.log(`Na deploy: https://www.sitebutler.be/portaal/${slug}`);
console.log("Daarna: git commit/push, of lokaal npm run build && npm run serve");
