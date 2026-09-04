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
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
