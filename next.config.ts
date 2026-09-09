import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "mysql2", "bcryptjs", "@mollie/api-client", "web-push", "nodemailer"],
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
