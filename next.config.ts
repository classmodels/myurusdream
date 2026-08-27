import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "@mollie/api-client"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
