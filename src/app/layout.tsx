import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { brand } from "@/data/site";

const vazir = localFont({
  src: "./fonts/Vazirmatn.woff2",
  variable: "--font-vazir",
  display: "swap",
  weight: "100 900",
  preload: true,
});

const siteUrl = "https://darband.coffee";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | ${brand.tagline}`,
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
    title: `${brand.name} | ${brand.tagline}`,
    description: brand.description,
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: brand.claim }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brand.name} | ${brand.tagline}`,
    description: brand.description,
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#22150e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  alternateName: brand.latinName,
  url: siteUrl,
  logo: `${siteUrl}/images/hero.jpg`,
  description: brand.description,
  email: brand.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: brand.address,
    addressLocality: "تهران",
    addressCountry: "IR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
