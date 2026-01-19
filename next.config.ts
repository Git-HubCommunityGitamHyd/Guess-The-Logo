// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 🔥 THIS FIXES THE BUILD ERROR
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yrfxcwyacoxoccmsauau.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
