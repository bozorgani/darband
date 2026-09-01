import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { Breadcrumb } from "@/components/ui/Disclosure";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها",
  description: "محصولاتی که برای خرید بعدی ذخیره کرده‌اید.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <>
      <div className="border-b border-beige-300/60 bg-cream-50">
        <div className="container-page py-10">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "علاقه‌مندی‌ها" }]} />
          <h1 className="mt-4 text-3xl font-black text-espresso-900 sm:text-4xl">
            علاقه‌مندی‌های من
          </h1>
          <p className="mt-3 max-w-xl text-sm/7 text-ash-600">
            فهرست شما روی همین دستگاه ذخیره می‌شود.
          </p>
        </div>
      </div>
      <WishlistView />
    </>
  );
}
