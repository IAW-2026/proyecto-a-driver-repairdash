import type { NextConfig } from "next";

// Extend NextConfig type to allow serverActions config
const nextConfig: NextConfig & { serverActions?: { bodySizeLimit?: string } } = {
  serverActions: {
    bodySizeLimit: "4.5MB",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "djkhqwujnhiajlvbgdot.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
