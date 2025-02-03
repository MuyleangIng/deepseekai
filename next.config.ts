import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove swcMinify as it's causing issues
  experimental: {
    // Remove optimizeCss since it requires critters
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000,
  },
  // Add required dependency
  webpack: (config) => {
    config.ignoreWarnings = [
      { message: /Critical dependency/i },
      { message: /Failed to parse source map/i },
    ];
    return config;
  }
};

export default nextConfig;