import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/login/verify',
        destination: '/api/auth/magic-link/verify',
      },
    ];
  },
};

export default nextConfig;
