"use client";

import Image from "next/image";
import Link from "next/link";
import { Drawer } from "@/components/ui/Overlay";
import { useStore, FREE_SHIPPING_THRESHOLD } from "@/store/store";
import { formatPrice, formatNumber, toPersianDigits } from "@/lib/format";
import { BagIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "@/components/ui/Icons";
import { EmptyState } from "@/components/ui/Feedback";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getBestSellers } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types";

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    items,
    itemCount,
    subtotal,
    total,
    shipping,
    discountAmount,
    freeShippingRemaining,
  } = useStore();

  const suggestions = getBestSellers(3).filter(
    (p) => !items.some((i) => i.productId === p.id),
  );

  return (
    <Drawer
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      title="سبد خرید"
      description={
        itemCount > 0 ? `${toPersianDigits(itemCount)} مورد در سبد شما` : "هنوز چیزی اضافه نکرده‌اید"
      }
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <dl className="space-y-1.5 text-sm">
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
              <div className="flex justify-between border-t border-beige-300/70 pt-2.5 text-base font-bold text-espresso-900">
                <dt>مبلغ قابل پرداخت</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/cart" variant="outline" onClick={() => setCartOpen(false)}>
                مشاهده سبد
              </ButtonLink>
              {/* TODO(backend): checkout requires a real orders/payment API. */}
              <Button onClick={() => setCartOpen(false)}>ادامه خرید</Button>
            </div>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<BagIcon className="size-7" />}
            title="سبد خرید شما خالی است"
            description="از میان قهوه‌های تک‌خاستگاه، ترکیب‌های امضای دربند و تجهیزات دم‌آوری انتخاب کنید."
            actionLabel="رفتن به فروشگاه"
            actionHref="/shop"
            className="border-0 bg-transparent py-10"
          />
          <div className="mt-4 space-y-5">
            <h3 className="text-sm font-bold text-espresso-900">پیشنهاد دربند</h3>
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-5">
          <FreeShippingMeter subtotal={subtotal} remaining={freeShippingRemaining} />
          <ul className="mt-5 divide-y divide-beige-300/60">
            {items.map((item) => (
              <li key={item.key} className="py-4 first:pt-0">
                <CartRow item={item} />
              </li>
            ))}
          </ul>

          {suggestions.length > 0 && (
            <div className="mt-8 border-t border-beige-300/60 pt-6">
              <h3 className="mb-4 text-sm font-bold text-espresso-900">این‌ها را هم ببینید</h3>
              <div className="space-y-5">
                {suggestions.slice(0, 2).map((p) => (
                  <ProductCard key={p.id} product={p} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

export function FreeShippingMeter({
  subtotal,
  remaining,
  className,
}: {
  subtotal: number;
  remaining: number;
  className?: string;
}) {
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <div className={cn("rounded-2xl bg-cream-100/70 p-4", className)}>
      <div className="flex items-center gap-2 text-xs text-espresso-800">
        <TruckIcon className="size-4 shrink-0 text-accent-600" />
        {remaining > 0 ? (
          <p>
            <span className="font-semibold">{formatNumber(remaining)} تومان</span> تا ارسال رایگان
            باقی مانده است.
          </p>
        ) : (
          <p className="font-semibold text-success">ارسال سفارش شما رایگان است 🎉</p>
        )}
      </div>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-beige-300/70"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="پیشرفت تا ارسال رایگان"
      >
        <div
          className="h-full rounded-full bg-accent-600 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function CartRow({ item, showImage = true }: { item: CartItem; showImage?: boolean }) {
  const { setQuantity, removeItem } = useStore();

  return (
    <div className="flex gap-4">
      {showImage && (
        <Link
          href={`/product/${item.slug}`}
          className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-cream-100"
        >
          <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-espresso-900">
              <Link href={`/product/${item.slug}`} className="hover:text-accent-600">
                {item.title}
              </Link>
            </h3>
            {item.options.length > 0 && (
              <p className="mt-1 text-[0.7rem] text-ash-600">
                {item.options.map((o) => `${o.label}: ${o.value}`).join(" · ")}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            aria-label={`حذف ${item.title} از سبد خرید`}
            className="shrink-0 rounded-full p-1.5 text-ash-400 transition hover:bg-danger/10 hover:text-danger"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-espresso-900/15">
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity - 1)}
              aria-label="کاهش تعداد"
              className="flex size-8 items-center justify-center rounded-full text-espresso-800 transition hover:bg-espresso-900/6"
            >
              <MinusIcon className="size-3.5" />
            </button>
            <span
              className="min-w-8 text-center text-sm font-bold tabular-nums"
              aria-live="polite"
              aria-label={`تعداد: ${toPersianDigits(item.quantity)}`}
            >
              {toPersianDigits(item.quantity)}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(item.key, item.quantity + 1)}
              aria-label="افزایش تعداد"
              className="flex size-8 items-center justify-center rounded-full text-espresso-800 transition hover:bg-espresso-900/6"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>
          <p className="text-sm font-bold text-espresso-900">
            {formatPrice(item.unitPrice * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
