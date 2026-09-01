import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/wishlist", "/auth", "/auth/", "/account", "/account/"] }],
    sitemap: "https://darband.coffee/sitemap.xml",
  };
}
