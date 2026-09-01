"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/store";
import { CartRow, FreeShippingMeter } from "@/components/cart/CartDrawer";
import { EmptyState } from "@/components/ui/Feedback";
import { BagIcon, TruckIcon, ShieldIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { getBestSellers } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/Primitives";
import { useToast } from "@/store/toast";

export function CartView() {
  const {
    items,
    itemCount,
    subtotal,
    total,
    shipping,
    discount,
    discountAmount,
    applyDiscount,
    removeDiscount,
    freeShippingRemaining,
    clearCart,
    hydrated,
  } = useStore();
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const suggestions = getBestSellers(4).filter(
    (p) => !items.some((i) => i.productId === p.id),
  );

  if (!hydrated) {
    return (
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-24 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<BagIcon className="size-7" />}
          title="سبد خرید شما خالی است"
          description="هنوز چیزی انتخاب نکرده‌اید. از میان قهوه‌های تک‌خاستگاه و تجهیزات دم‌آوری دربند شروع کنید."
          actionLabel="رفتن به فروشگاه"
          actionHref="/shop"
        />
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-espresso-900">پیشنهادهای پرفروش</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
        {/* Items */}
        <section aria-label="کالاهای سبد خرید">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-espresso-900">
              {toPersianDigits(itemCount)} کالا در سبد
            </h2>
            <button
              type="button"
              onClick={() => {
                clearCart();
                toast({ tone: "danger", title: "سبد خرید خالی شد" });
              }}
              className="text-xs text-ash-600 underline underline-offset-4 transition hover:text-danger"
            >
              خالی کردن سبد
            </button>
          </div>

          <FreeShippingMeter subtotal={subtotal} remaining={freeShippingRemaining} className="mb-6" />

          <ul className="divide-y divide-beige-300/60 border-y border-beige-300/60">
            {items.map((item) => (
              <li key={item.key} className="py-5">
                <CartRow item={item} />
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mt-6 inline-flex text-sm font-semibold text-espresso-900 underline-offset-8 hover:underline"
          >
            ← ادامه خرید
          </Link>
        </section>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-beige-300/70 bg-cream-50/60 p-6">
            <h2 className="text-base font-bold text-espresso-900">خلاصه سفارش</h2>

            {/* Discount */}
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (applyDiscount(code)) setCode("");
              }}
            >
              <label htmlFor="discount" className="mb-1.5 block text-xs font-semibold text-espresso-800">
                کد تخفیف
              </label>
              <div className="flex gap-2">
                <input
                  id="discount"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="مثلاً DARBAND10"
                  dir="ltr"
                  className="h-11 flex-1 rounded-full border border-espresso-900/15 bg-white/80 px-4 text-sm text-espresso-900 placeholder:text-ash-400 focus:border-accent-600 focus:outline-none"
                />
                <Button type="submit" variant="outline">
                  اعمال
                </Button>
              </div>
              <p className="mt-1.5 text-[0.68rem] text-ash-600">
                کدهای فعال آزمایشی: <span className="latin">DARBAND10</span> و{" "}
                <span className="latin">FILTER20</span>
              </p>
            </form>

            {discount && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-success/10 px-3 py-2 text-xs text-success">
                <span>{discount.label}</span>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="underline underline-offset-2"
                >
                  حذف
                </button>
              </div>
            )}

            <dl className="mt-6 space-y-2.5 border-t border-beige-300/70 pt-5 text-sm">
              <div className="flex justify-between text-ash-600">
                <dt>جمع کالاها</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>تخفیف</dt>
                  <dd>− {formatPrice(discountAmount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-ash-600">
                <dt>هزینه ارسال</dt>
                <dd>{shipping === 0 ? "رایگان" : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-beige-300/70 pt-3 text-lg font-black text-espresso-900">
                <dt>مبلغ قابل پرداخت</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {/* TODO(backend): real checkout needs orders + payment gateway APIs. */}
            <Button
              size="lg"
              fullWidth
              className="mt-6"
              onClick={() =>
                toast({
                  tone: "info",
                  title: "پرداخت در این نسخه فعال نیست",
                  description: "این نمونه فقط رابط کاربری است؛ درگاه پرداخت متصل نشده است.",
                })
              }
            >
              ادامه فرآیند پرداخت
            </Button>

            <ul className="mt-5 space-y-2 text-[0.7rem] text-ash-600">
              <li className="flex items-center gap-2">
                <TruckIcon className="size-4 text-accent-600" />
                ارسال ۲۴ ساعته در تهران
              </li>
              <li className="flex items-center gap-2">
                <ShieldIcon className="size-4 text-accent-600" />
                پرداخت امن و ضمانت بازگشت وجه
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-xl font-bold text-espresso-900">تکمیل سفارش با…</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
