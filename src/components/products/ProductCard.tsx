"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { Badge, Price, Rating } from "@/components/ui/Primitives";
import { BagIcon, HeartIcon } from "@/components/ui/Icons";
import { roastLabels } from "@/data/categories";
import { useStore } from "@/store/store";

interface ProductCardProps {
  product: Product;
  /** `default` = editorial grid card, `compact` = horizontal list row. */
  variant?: "default" | "compact" | "editorial";
  priority?: boolean;
  index?: number;
  className?: string;
}

function ProductCardBase({
  product,
  variant = "default",
  priority = false,
  className,
}: ProductCardProps) {
  const { addProduct, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const secondImage = product.images[1] ?? product.images[0];
  const href = `/product/${product.slug}`;

  if (variant === "compact") {
    return (
      <div className={cn("group flex gap-4", className)}>
        <Link
          href={href}
          className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-cream-100"
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={product.images[0]}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-espresso-900">
            <Link href={href} className="hover:text-accent-600">
              {product.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-ash-600">{product.tagline}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Price value={product.price} size="sm" />
            <button
              type="button"
              onClick={() => addProduct(product)}
              disabled={!product.inStock}
              className="rounded-full border border-espresso-900/15 px-3 py-1 text-[0.7rem] font-semibold text-espresso-800 transition hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50 disabled:opacity-40"
            >
              افزودن
            </button>
          </div>
        </div>
      </div>
    );
  }

  const editorial = variant === "editorial";

  return (
    <article
      className={cn(
        "group relative flex flex-col",
        editorial && "sm:flex-row sm:items-center sm:gap-7",
        className,
      )}
    >
      {/* ---------------------------- Media ---------------------------- */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-cream-100",
          editorial ? "aspect-square w-full sm:w-52 sm:shrink-0" : "aspect-4/5 w-full",
        )}
      >
        <Link href={href} className="absolute inset-0 z-10" aria-label={product.title}>
          <span className="sr-only">{product.title}</span>
        </Link>

        <Image
          src={product.images[0]}
          alt={`${product.title} — ${product.tagline}`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-0"
        />
        <Image
          src={secondImage}
          alt=""
          aria-hidden="true"
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="scale-105 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100"
        />

        {/* Badges */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-wrap items-start gap-1.5">
          {product.isNew && <Badge tone="dark">تازه رسیده</Badge>}
          {product.badges?.slice(0, 1).map((b) => (
            <Badge key={b} tone="accent">
              {b}
            </Badge>
          ))}
          {!product.inStock && <Badge tone="danger">ناموجود</Badge>}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-pressed={wished}
          aria-label={wished ? `حذف ${product.title} از علاقه‌مندی‌ها` : `افزودن ${product.title} به علاقه‌مندی‌ها`}
          className={cn(
            "absolute end-3 top-3 z-20 flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100",
            wished
              ? "bg-accent-600 text-white md:opacity-100"
              : "bg-white/85 text-espresso-900 hover:bg-white",
          )}
        >
          <HeartIcon className="size-[18px]" filled={wished} />
        </button>

        {/* Quick add + flavor notes */}
        <div className="absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:hidden">
          {product.flavorNotes.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1">
              {product.flavorNotes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="rounded-full bg-espresso-950/60 px-2 py-0.5 text-[0.65rem] font-medium text-cream-50 backdrop-blur-sm"
                >
                  {note}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => addProduct(product)}
            disabled={!product.inStock}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-offwhite/95 text-xs font-bold text-espresso-900 shadow-lg backdrop-blur-sm transition hover:bg-espresso-900 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-offwhite/95 disabled:hover:text-espresso-900"
          >
            <BagIcon className="size-4" />
            {product.inStock ? "افزودن سریع" : "ناموجود"}
          </button>
        </div>
      </div>

      {/* ---------------------------- Content --------------------------- */}
      <div className={cn("flex flex-1 flex-col pt-3.5", editorial && "sm:pt-0")}>
        <div className="flex items-center gap-2 text-[0.7rem] text-ash-600">
          {product.origin?.country && <span>{product.origin.country}</span>}
          {product.origin?.country && product.roast && (
            <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
          )}
          {product.roast && <span>{roastLabels[product.roast]}</span>}
        </div>

        <h3 className={cn("mt-1.5 font-bold text-espresso-900", editorial ? "text-xl" : "text-[0.95rem]")}>
          <Link href={href} className="transition-colors hover:text-accent-600">
            {product.title}
          </Link>
        </h3>

        <p
          className={cn(
            "mt-1 text-xs/6 text-ash-600",
            editorial ? "line-clamp-3 text-sm/7" : "line-clamp-1",
          )}
        >
          {editorial ? product.description : product.tagline}
        </p>

        {editorial && product.flavorNotes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.flavorNotes.slice(0, 4).map((n) => (
              <Badge key={n} tone="outline">
                {n}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>

        <div className={cn("mt-2.5 flex items-center justify-between gap-3", editorial && "mt-5")}>
          <Price value={product.price} compareAt={product.compareAtPrice} />
          {editorial && (
            <button
              type="button"
              onClick={() => addProduct(product)}
              disabled={!product.inStock}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-espresso-900 px-5 text-xs font-bold text-cream-50 transition hover:bg-accent-600 disabled:opacity-40"
            >
              <BagIcon className="size-4" />
              افزودن به سبد
            </button>
          )}
        </div>

        {/* Mobile quick add */}
        {!editorial && (
          <button
            type="button"
            onClick={() => addProduct(product)}
            disabled={!product.inStock}
            className="mt-3 h-9 w-full rounded-full border border-espresso-900/15 text-xs font-semibold text-espresso-800 transition active:scale-[0.98] disabled:opacity-40 md:hidden"
          >
            {product.inStock ? "افزودن به سبد" : "ناموجود"}
          </button>
        )}
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: Product[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < priorityCount}
          index={i}
        />
      ))}
    </div>
  );
}
