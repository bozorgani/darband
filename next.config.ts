import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Frontend-only storefront: no rewrites, no server APIs. */
  devIndicators: false,
  images: {
    // Local assets only; tuned for the card / hero breakpoints actually used.
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [48, 80, 96, 128, 240, 320],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@/components/ui/Icons"],
  },
};

export default nextConfig;
