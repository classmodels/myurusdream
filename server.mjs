import { createServer, request as httpRequest } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { parse } from "node:url";

process.env.DATABASE_URL ||= "mysql://unused:unused@127.0.0.1:3306/unused";

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const root = process.cwd();

/**
 * Echte oorzaak van de 500 op /portaal/myurusdream:
 * twee Next.js-apps in HETZELFDE Node-proces delen AsyncLocalStorage
 * → "Cannot access entryCSSFiles without a work store".
 * Oplossing: elke klantsite in een apart child-proces + reverse proxy.
 */
function loadNext(appDir) {
  const req = createRequire(path.join(appDir, "package.json"));
  return req("next");
}

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

function waitForHttp(targetPort, attempts = 60) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tick = () => {
      n += 1;
      const req = httpRequest(
        { hostname: "127.0.0.1", port: targetPort, path: "/", method: "GET", timeout: 1000 },
        (res) => {
          res.resume();
          resolve();
        },
      );
      req.on("error", () => {
        if (n >= attempts) reject(new Error(`Klantsite op poort ${targetPort} start niet op tijd`));
        else setTimeout(tick, 250);
      });
      req.on("timeout", () => {
        req.destroy();
        if (n >= attempts) reject(new Error(`Klantsite op poort ${targetPort} start niet op tijd`));
        else setTimeout(tick, 250);
      });
      req.end();
    };
    tick();
  });
}

function proxyTo(req, res, targetPort) {
  const headers = { ...req.headers, host: `127.0.0.1:${targetPort}` };
  const upstream = httpRequest(
    {
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers,
    },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    },
  );
  upstream.on("error", (error) => {
    console.error("Proxyfout klantsite", error.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end("Klantsite tijdelijk niet bereikbaar.");
    }
  });
  req.pipe(upstream);
}

function startSiteChild(site, childPort) {
  const dir = path.resolve(root, site.dir);
  const prefix = sitePrefix(site);
  const nextBin = path.join(dir, "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) {
    throw new Error(`Geen next binary in ${dir}`);
  }
  const child = spawn(
    process.execPath,
    [nextBin, "start", "-H", "127.0.0.1", "-p", String(childPort)],
    {
      cwd: dir,
      env: {
        ...process.env,
        NODE_ENV: "production",
        PORT: String(childPort),
        HOSTNAME: "127.0.0.1",
        SITEBUTLER_BASE_PATH: prefix,
        NEXT_PUBLIC_BASE_PATH: prefix,
        NEXT_PUBLIC_SITE_URL:
          process.env.NEXT_PUBLIC_SITE_URL || "https://www.sitebutler.be",
      },
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  child.on("exit", (code, signal) => {
    console.error(`Klantsite ${prefix} gestopt (code=${code}, signal=${signal})`);
  });
  return { child, port: childPort, prefix, dir };
}

async function main() {
  const rootNext = loadNext(root);
  const mainApp = rootNext({ dev, dir: root });
  await mainApp.prepare();
  const mainHandle = mainApp.getRequestHandler();

  const children = [];
  const proxies = [];

  if (!dev) {
    let childPort = Number(process.env.SITEBUTLER_SITE_PORT_BASE || port + 100);
    for (const site of loadSites()) {
      const dir = path.resolve(root, site.dir);
      const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
      if (!slug || !existsSync(dir)) continue;
      if (!existsSync(path.join(dir, ".next", "BUILD_ID"))) {
        console.warn(`Site ${sitePrefix(site)} overgeslagen: geen productiebuild in ${dir}`);
        continue;
      }
      const started = startSiteChild(site, childPort);
      children.push(started.child);
      console.log(`→ Klantsite ${started.prefix} → 127.0.0.1:${started.port}`);
      await waitForHttp(started.port);
      proxies.push({ prefix: started.prefix, port: started.port });
      childPort += 1;
    }
  }

  const shortAliases = loadSites()
    .map((site) => {
      const slug = String(site.slug || "").replace(/^\/+|\/+$/g, "");
      const prefix = sitePrefix(site);
      if (!slug || prefix === `/${slug}`) return null;
      return { from: `/${slug}`, to: prefix };
    })
    .filter(Boolean);

  const shutdown = () => {
    for (const child of children) {
      try {
        child.kill("SIGTERM");
      } catch {
        /* ignore */
      }
    }
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

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
    const match = proxies.find(
      (site) => pathname === site.prefix || pathname.startsWith(`${site.prefix}/`),
    );
    try {
      if (match) {
        proxyTo(req, res, match.port);
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
    const names = proxies.map((s) => `${s.prefix}→:${s.port}`).join(", ") || "geen";
    console.log(`SiteButler op http://${host}:${port} · klantsites: ${names}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
