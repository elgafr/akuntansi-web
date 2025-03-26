import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.krisnabmntr.my.id/api/:path*",
      },
      {
        source: "/storage/:path*",
        destination: "https://api.krisnabmntr.my.id/storage/:path*",
      }
    ];
  },
};

export default nextConfig;