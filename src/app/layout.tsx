import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { brand } from "@/data/site";
import { absoluteUrl, siteConfig } from "@/config/site";

const vazir = localFont({
  src: "./fonts/Vazirmatn.woff2",
  variable: "--font-vazir",
  display: "swap",
  weight: "100 900",
  preload: true,
});

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand.name,
  manifest: "/manifest.webmanifest",
  title: {
    default: `خرید قهوه تازه‌رست و تخصصی | ${brand.name}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  keywords: [
    "قهوه تخصصی",
    "خرید قهوه",
    "قهوه دانه",
    "اسپرسو",
    "رستری قهوه",
    "قهوه تازه رست",
    "تجهیزات دم آوری",
  ],
  authors: [{ name: brand.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: brand.name,
    title: `خرید قهوه تازه‌رست و تخصصی | ${brand.name}`,
    description: brand.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${brand.name} — ${brand.tagline}`,
      },
    ],
  },
  /* No title/description here: Next falls back to each page's own values. */
  twitter: {
    card: "summary_large_image",
    images: [siteConfig.ogImage],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: brand.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#22150e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "auto",
};

/**
 * Store identity. Only verified facts are emitted — no address, phone, email or
 * social profiles until the owner confirms them (see `brand` in `data/site.ts`).
 * TODO(brand): add `logo`, `email`, `telephone`, `address` and `sameAs` here
 * once the real values exist.
 */
const storeSchema = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteUrl}/#store`,
  name: brand.name,
  alternateName: siteConfig.latinName,
  url: absoluteUrl("/"),
  description: brand.description,
  inLanguage: siteConfig.languageTag,
  areaServed: { "@type": "Country", name: "Iran" },
};

/** Site-level entity + the search endpoint the storefront really supports. */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: brand.name,
  alternateName: siteConfig.latinName,
  url: absoluteUrl("/"),
  inLanguage: siteConfig.languageTag,
  publisher: { "@id": `${siteUrl}/#store` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W16841V8T2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W16841V8T2');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
