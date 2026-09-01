import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Breadcrumb } from "@/components/ui/Disclosure";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "بررسی و ویرایش سبد خرید قهوه دربند پیش از نهایی کردن سفارش.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <div className="border-b border-beige-300/60 bg-cream-50">
        <div className="container-page py-10">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "سبد خرید" }]} />
          <h1 className="mt-4 text-3xl font-black text-espresso-900 sm:text-4xl">سبد خرید</h1>
        </div>
      </div>
      <CartView />
    </>
  );
}
