/**
 * Single source of truth for brand identity, canonical host and locale.
 *
 * Every SEO surface (metadata, canonical URLs, sitemap, robots, JSON-LD, OG)
 * reads from here — never hard-code the domain anywhere else.
 */

const FALLBACK_URL = "https://ghahvino.ir";

/** Trailing slashes are stripped so `absoluteUrl()` never produces `//`. */
function normalizeSiteUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim() || FALLBACK_URL;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return FALLBACK_URL;
  }

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname);
  if (process.env.NODE_ENV === "production" && isLocal) {
    // A localhost canonical would poison every canonical/sitemap entry.
    return FALLBACK_URL;
  }

  return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/+$/, "");
}

export const siteConfig = {
  /** Public brand name (Persian). */
  name: "قهوینو",
  /** Latin transliteration used for `alternateName` and the wordmark. */
  latinName: "Ghahvino",
  /** Canonical origin — https, no `www`, no trailing slash. */
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "fa_IR",
  language: "fa",
  /** BCP-47 tag for `inLanguage` in structured data. */
  languageTag: "fa-IR",
  country: "IR",
  tagline: "فروشگاه اینترنتی قهوه تخصصی",
  /** Shared social/OG preview image. TODO(brand): replace with a 1200×630 Ghahvino artwork. */
  ogImage: "/images/hero.jpg",
} as const;

/** Builds an absolute, canonical URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return suffix === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${suffix}`;
}

/**
 * Page-level `openGraph` blocks REPLACE the root one in Next's metadata merge,
 * so every page spreads these shared fields to keep `og:site_name`/`og:locale`.
 */
export const sharedOpenGraph: {
  siteName: string;
  locale: string;
  images: { url: string; width: number; height: number; alt: string }[];
} = {
  siteName: siteConfig.name,
  locale: siteConfig.locale,
  images: [
    {
      url: siteConfig.ogImage,
      width: 1200,
      height: 630,
      alt: `${siteConfig.name} — ${siteConfig.tagline}`,
    },
  ],
};
