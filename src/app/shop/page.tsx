import { absoluteUrl, sharedOpenGraph } from "@/config/site";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopView } from "@/components/products/ShopView";
import { Breadcrumb } from "@/components/ui/Disclosure";
import { ProductGrid } from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { sortProducts } from "@/lib/filtering";

export const metadata: Metadata = {
  title: "فروشگاه قهوه تخصصی و تازه‌رست",
  description:
    "خرید قهوه تخصصی، قهوه دانه و قهوه آسیاب‌شده تازه‌رست با قیمت مشخص؛ فیلتر بر اساس خاستگاه، درجه رست، روش دم‌آوری و محدوده قیمت.",
  alternates: { canonical: "/shop" },
  openGraph: {
    ...sharedOpenGraph,
    type: "website",
    url: absoluteUrl("/shop"),
    title: "فروشگاه قهوه تخصصی قهوینو",
    description: "کاتالوگ کامل قهوه‌های تک‌خاستگاه، ترکیب‌ها و تجهیزات دم‌آوری.",
  },
};

export default function ShopPage() {
  return (
    <>
      <div className="border-b border-beige-300/60 bg-cream-50">
        <div className="container-page py-10 lg:py-14">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "فروشگاه" }]} />
          <h1 className="mt-4 text-3xl font-black text-espresso-900 sm:text-4xl">
            فروشگاه قهوه تخصصی قهوینو
          </h1>
          <p className="mt-3 max-w-2xl text-sm/7 text-ash-600">
            هر لات پیش از انتشار در جلسه کاپینگ هفتگی امتیاز می‌گیرد. فیلترها را بر اساس ذائقه و
            روش دم‌آوری خود تنظیم کنید.
          </p>
        </div>
      </div>

      {/* The interactive shop reads `useSearchParams`, so it is client-only.
          The fallback server-renders the default catalogue so crawlers and
          no-JS visitors still get a full product list. */}
      {/* Names the product list for screen readers and keeps the heading order
          h1 → h2 → h3 (product titles). */}
      <h2 className="sr-only">فهرست محصولات فروشگاه قهوینو</h2>

      <Suspense
        fallback={
          <div className="container-page pb-20 pt-8 lg:pt-10">
            {/* Server-rendered catalogue: the first (above-the-fold) row is
                `priority`, so Next preloads those images in the initial HTML.
                The hydrated grid reuses the same srcs, so nothing double-fetches
                and the LCP image is discovered early instead of after hydration. */}
            <ProductGrid
              products={sortProducts(products, "featured").slice(0, 12)}
              priorityCount={4}
            />
          </div>
        }
      >
        <ShopView />
      </Suspense>
    </>
  );
}
