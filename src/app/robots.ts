import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

/**
 * Crawling rules. Private, personalised routes are kept out of the index —
 * note this is a crawler directive, not access control: the account guard is
 * still a client-side mock (see `AccountGuard`).
 * CSS, JS, fonts and images stay crawlable so Google can render the pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/wishlist", "/auth", "/auth/", "/account", "/account/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
