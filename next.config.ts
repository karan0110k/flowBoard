import type { NextConfig } from "next";

const nextConfig = {
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
