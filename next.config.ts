import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
