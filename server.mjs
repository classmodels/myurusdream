import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "node:url";
import next from "next";

process.env.DATABASE_URL ||= "mysql://unused:unused@127.0.0.1:3306/unused";

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const root = process.cwd();

function loadSites() {
  const file = path.join(root, "sites.json");
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sitePrefix(site) {
  const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
  const custom = String(site.basePath || "").replace(/\/$/, "");
  return custom || `/portaal/${slug}`;
}

async function main() {
  const mainApp = next({ dev, dir: root });
  const sites = loadSites()
    .map((site) => {
      const dir = path.resolve(root, site.dir);
      const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
      if (!slug || !existsSync(dir)) return null;
      const built = existsSync(path.join(dir, ".next"));
      if (!dev && !built) {
        console.warn(`Site ${sitePrefix(site)} overgeslagen: nog geen build in ${dir}`);
        return null;
      }
      return {
        slug,
        prefix: sitePrefix(site),
        app: next({ dev, dir }),
      };
    })
    .filter(Boolean);

  await mainApp.prepare();
  await Promise.all(sites.map((site) => site.app.prepare()));

  const mainHandle = mainApp.getRequestHandler();
  const siteHandles = sites.map((site) => ({
    prefix: site.prefix,
    handle: site.app.getRequestHandler(),
  }));
  const shortAliases = loadSites()
    .map((site) => {
      const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
      const prefix = sitePrefix(site);
      if (!slug || prefix === `/${slug}`) return null;
      return { from: `/${slug}`, to: prefix };
    })
    .filter(Boolean);

  createServer((req, res) => {
    const parsed = parse(req.url || "/", true);
    const pathname = parsed.pathname || "/";
    const alias = shortAliases.find(
      (row) => pathname === row.from || pathname.startsWith(`${row.from}/`),
    );
    if (alias) {
      const rest = pathname.slice(alias.from.length);
      const search = parsed.search || "";
      res.writeHead(302, { Location: `${alias.to}${rest}${search}` });
      res.end();
      return;
    }
    const match = siteHandles.find(
      (site) => pathname === site.prefix || pathname.startsWith(`${site.prefix}/`),
    );
    try {
      if (match) {
        match.handle(req, res, parsed);
        return;
      }
      mainHandle(req, res, parsed);
    } catch (error) {
      console.error("SiteButler requestfout", pathname, error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Er ging iets mis. Probeer opnieuw.");
      }
    }
  }).listen(port, host, () => {
    const names = siteHandles.map((s) => s.prefix).join(", ") || "geen";
    console.log(`SiteButler op http://${host}:${port} · klantsites: ${names}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
