import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";

const base = "https://darband.coffee";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/shop", "/about", "/journal", "/contact", "/faq", "/shipping", "/returns"].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    }),
  );

  return [
    ...staticRoutes,
    ...categories.map((c) => ({
      url: `${base}/shop?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${base}/journal/${a.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
