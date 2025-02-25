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
        source: "/api/:path*", // Mengarahkan semua permintaan ke /api/* ke backend Laravel
        destination: "http://127.0.0.1:8000/api/:path*", // Backend Laravel di localhost:8000
      },
    ];
  },
};

export default nextConfig;