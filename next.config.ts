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
  // Suppress React development warnings
  reactStrictMode: true,
  // Optional: Add webpack configuration to suppress specific warnings
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.ignoreWarnings = [
        /Warning: ReactDOM\.render is no longer supported/,
        /Warning: componentWillReceiveProps has been renamed/,
        /Warning: componentWillUpdate has been renamed/,
      ];
    }
    return config;
  },
};

export default nextConfig;
