import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "قهوینو",
    short_name: "قهوینو",
    description: "فروشگاه آنلاین قهوه تازه‌رست و تخصصی قهوینو",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#fbf8f4",
    theme_color: "#22150e",
    lang: "fa-IR",
    dir: "rtl",
    categories: ["shopping", "food", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "فروشگاه قهوینو", short_name: "فروشگاه", url: "/shop" },
      { name: "سبد خرید", short_name: "سبد خرید", url: "/cart" },
      { name: "علاقه‌مندی‌ها", short_name: "علاقه‌مندی‌ها", url: "/wishlist" },
      { name: "ژورنال قهوینو", short_name: "ژورنال", url: "/journal" },
    ],
  };
}
