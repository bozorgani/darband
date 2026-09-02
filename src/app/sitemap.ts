import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { articles } from "@/data/articles";
import { infoPages } from "@/data/pages";
import { absoluteUrl } from "@/config/site";
import { jalaliToIsoDate } from "@/lib/format";

/**
 * Only canonical, indexable, 200-status URLs belong here.
 *
 * Excluded on purpose: `/auth`, `/auth/verify`, `/account/*`, `/cart`,
 * `/wishlist` (all `noindex`) and every filtered `/shop?...` variant, whose
 * canonical is `/shop`.
 *
 * `lastModified` is only set where the content layer carries a real date —
 * a build-time `new Date()` would be a fabricated freshness signal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/journal"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
  ];

  const contentPages: MetadataRoute.Sitemap = infoPages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/product/${product.slug}`),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => {
    const iso = jalaliToIsoDate(article.date);
    return {
      url: absoluteUrl(`/journal/${article.slug}`),
      ...(iso ? { lastModified: new Date(iso) } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    };
  });

  return [...staticRoutes, ...contentPages, ...productPages, ...articlePages];
}
