import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@untraced/sdk"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.mypinata.cloud",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "*.pinata.cloud",
      },
    ],
  },
};

export default nextConfig;
