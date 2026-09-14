import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/myurusdream",
        destination: "/portaal/myurusdream",
        permanent: false,
      },
      {
        source: "/myurusdream/:path*",
        destination: "/portaal/myurusdream/:path*",
        permanent: false,
      },
      {
        source: "/zetor-museum",
        destination: "/portaal/zetor-museum",
        permanent: false,
      },
      {
        source: "/zetor-museum/:path*",
        destination: "/portaal/zetor-museum/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
