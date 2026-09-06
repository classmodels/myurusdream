import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma", "mysql2", "bcryptjs", "@mollie/api-client", "web-push"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
