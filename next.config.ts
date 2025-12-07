// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yrfxcwyacoxoccmsauau.supabase.co", // Your actual Supabase domain
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimize image loading
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for 7 days
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 150, 200, 256],
  },
};

export default nextConfig;
