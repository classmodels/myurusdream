import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function resolveBasePath() {
  const fromEnv = (process.env.NEXT_PUBLIC_BASE_PATH || process.env.SITEBUTLER_BASE_PATH || "").replace(
    /\/$/,
    "",
  );
  if (fromEnv) return fromEnv;
  const marker = path.join(__dirname, ".sitebutler-basepath");
  if (existsSync(marker)) {
    return readFileSync(marker, "utf8").trim().replace(/\/$/, "");
  }
  return "";
}

const nestedPath = resolveBasePath();

const nextConfig: NextConfig = {
  basePath: nestedPath || undefined,
  serverExternalPackages: ["@prisma/client", "prisma", "mysql2", "bcryptjs", "@mollie/api-client", "web-push", "nodemailer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    // Old logo URLs under /uploads/... → durable media API (files live outside Autogit).
    return [{ source: "/uploads/:path*", destination: "/api/media/:path*" }];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
