import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use default .next directory to avoid OneDrive conflicts
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
