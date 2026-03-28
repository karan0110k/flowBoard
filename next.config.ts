import type { NextConfig } from "next";

const nextConfig = {
<<<<<<< HEAD
  eslint: {
    ignoreDuringBuilds: true,
  },
}
=======
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
>>>>>>> 7b37706 (Fix build errors and update FlowBoard)

export default nextConfig
