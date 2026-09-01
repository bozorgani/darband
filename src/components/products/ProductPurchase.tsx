"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { useStore } from "@/store/store";
import { Button } from "@/components/ui/Button";
import { Price, Rating, Badge } from "@/components/ui/Primitives";
import { BagIcon, HeartIcon, MinusIcon, PlusIcon, TruckIcon, ShieldIcon, RefreshIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { roastLabels } from "@/data/categories";

/** Variant selection + add-to-cart. Client island inside a server page. */
export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted, setCartOpen } = useStore();
  const wished = isWishlisted(product.id);

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (product.variants ?? []).map((group) => [group.id, group.options[0].id]),
    ),
  );
  const [quantity, setQuantity] = useState(1);

  const unitPrice = useMemo(() => {
    let price = product.price;
    for (const group of product.variants ?? []) {
      const option = group.options.find((o) => o.id === selection[group.id]);
      price += option?.priceDelta ?? 0;
    }
    return price;
  }, [product, selection]);

  const compareAt = product.compareAtPrice
    ? product.compareAtPrice + (unitPrice - product.price)
    : undefined;

  const selectedOptions = (product.variants ?? [])
    .filter((g) => !(g.id === "grind" && selection.form === "beans"))
    .map((g) => ({
      label: g.label,
      value: g.options.find((o) => o.id === selection[g.id])?.label ?? "",
    }));

  function handleAdd(buyNow = false) {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      unitPrice,
      compareAtPrice: compareAt,
      quantity,
      options: selectedOptions,
    });
    if (buyNow) setCartOpen(true);
  }

  const lowStock = product.inStock && (product.stockCount ?? 0) <= 10;

  return (
    <div>
      {/* Title block */}
      <div className="flex flex-wrap items-center gap-2">
        {product.badges?.map((b) => (
          <Badge key={b} tone="accent">
            {b}
          </Badge>
        ))}
        {product.roast && <Badge tone="outline">{roastLabels[product.roast]}</Badge>}
      </div>

      <h1 className="mt-3 text-3xl font-black leading-tight text-espresso-900 sm:text-4xl">
        {product.title}
      </h1>
      <p className="mt-2 text-sm/7 text-ash-600 sm:text-base/8">{product.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Rating value={product.rating} count={product.reviewCount} size="md" />
        <a href="#reviews" className="text-xs text-accent-600 underline underline-offset-4">
          خواندن نظرها
        </a>
      </div>

      <div className="mt-6">
        <Price value={unitPrice} compareAt={compareAt} size="lg" />
        <p className="mt-2 flex items-center gap-2 text-xs">
          {product.inStock ? (
            <>
              <span className="size-2 rounded-full bg-success" aria-hidden="true" />
              <span className={cn(lowStock ? "font-semibold text-accent-600" : "text-success")}>
                {lowStock
                  ? `تنها ${toPersianDigits(product.stockCount ?? 0)} عدد باقی مانده`
                  : "موجود در انبار"}
              </span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
              <span className="text-danger">ناموجود — به‌زودی شارژ می‌شود</span>
            </>
          )}
        </p>
      </div>

      <p className="mt-5 text-sm/8 text-ash-600">{product.description}</p>

      {/* Variants */}
      <div className="mt-7 space-y-5">
        {(product.variants ?? []).map((group) => {
          if (group.id === "grind" && selection.form === "beans") return null;
          return (
            <div key={group.id}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-espresso-900">{group.label}</span>
                <span className="text-xs text-ash-600">
                  {group.options.find((o) => o.id === selection[group.id])?.label}
                </span>
              </div>
              <div role="radiogroup" aria-label={group.label} className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const selected = selection[group.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={option.disabled}
                      onClick={() => setSelection((s) => ({ ...s, [group.id]: option.id }))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
                        selected
                          ? "border-espresso-900 bg-espresso-900 text-cream-50"
                          : "border-espresso-900/18 text-espresso-800 hover:border-espresso-900/50",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quantity */}
        <div>
          <span className="mb-2 block text-xs font-bold text-espresso-900">تعداد</span>
          <div className="inline-flex items-center rounded-full border border-espresso-900/18">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="کاهش تعداد"
              className="flex size-10 items-center justify-center rounded-full text-espresso-800 transition hover:bg-espresso-900/6"
            >
              <MinusIcon className="size-4" />
            </button>
            <span className="min-w-10 text-center text-sm font-bold tabular-nums" aria-live="polite">
              {toPersianDigits(quantity)}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="افزایش تعداد"
              className="flex size-10 items-center justify-center rounded-full text-espresso-800 transition hover:bg-espresso-900/6"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={() => handleAdd()} disabled={!product.inStock} className="flex-1">
          <BagIcon className="size-4" />
          افزودن به سبد خرید
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => handleAdd(true)}
          disabled={!product.inStock}
          className="flex-1"
        >
          خرید سریع
        </Button>
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={wished}
          aria-label={wished ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          className={cn(
            "flex h-13 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition sm:w-13 sm:px-0",
            wished
              ? "border-accent-600 bg-accent-600 text-white"
              : "border-espresso-900/18 text-espresso-900 hover:border-espresso-900",
          )}
        >
          <HeartIcon className="size-5" filled={wished} />
          <span className="sm:hidden">{wished ? "ذخیره شد" : "علاقه‌مندی"}</span>
        </button>
      </div>

      {/* Reassurance */}
      <ul className="mt-7 grid gap-3 border-t border-beige-300/70 pt-6 sm:grid-cols-3">
        {[
          { icon: <TruckIcon className="size-4" />, text: "ارسال رایگان بالای ۱٫۵ میلیون" },
          { icon: <RefreshIcon className="size-4" />, text: "۷ روز ضمانت بازگشت" },
          { icon: <ShieldIcon className="size-4" />, text: "تازگی تضمین‌شده" },
        ].map((item) => (
          <li key={item.text} className="flex items-center gap-2 text-[0.72rem] text-ash-600">
            <span className="text-accent-600">{item.icon}</span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
