import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

/**
 * Crawling rules.
 *
 * Policy: private routes (`/auth`, `/account/*`, `/cart`, `/wishlist`) are kept
 * OUT of the index via their own `noindex` meta directive and by being excluded
 * from `sitemap.xml`. They are deliberately NOT blocked in `robots.txt`:
 *
 *  - If a crawler is disallowed from fetching a URL it cannot see the page's
 *    `noindex` directive, so the URL can linger in results as an empty entry.
 *  - Allowing the fetch lets the crawler read `noindex` and drop the URL cleanly.
 *
 * This is a crawler directive, NOT access control. The account area is a
 * client-side mock; in a real backend, protection must be enforced by the
 * server + a valid session (see `AccountGuard`).
 *
 * `Host` is intentionally omitted: Google does not use the `Host:` directive
 * to pick a canonical host, and it has no other effect here — the canonical
 * URLs and the redirect rules configured at the hosting/CDN layer are the real
 * mechanism (see RESPONSIVE_SEO_AUDIT.md § ۱۳).
 *
 * CSS, JS, fonts and images stay crawlable so Google can render each page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
