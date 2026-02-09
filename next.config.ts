import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      // DigitalOcean Spaces CDN (images uploadées depuis l’admin)
      {
        protocol: "https",
        hostname: "**.cdn.digitaloceanspaces.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
