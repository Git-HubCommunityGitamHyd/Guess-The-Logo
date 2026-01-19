// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 Fix Vercel fsPath build error (ESLint flat config issue)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image config (Supabase CDN)
  images: {
    unoptimized: true,
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
