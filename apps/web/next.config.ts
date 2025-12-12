import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@untraced/sdk"],
};

export default nextConfig;
