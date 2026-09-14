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
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "192.168.0.189",
    "sponsor-leading-clusters-fish.trycloudflare.com",
    "eighty-wasps-attack.loca.lt",
  ],
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "usercontent.one",
      },
    ],
  },
};

export default nextConfig;
