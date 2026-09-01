"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/store";
import { useDebounced, useFocusTrap, useLockBodyScroll } from "@/hooks";
import { Portal } from "@/components/ui/Overlay";
import { SearchIcon, XIcon, ArrowUpLeftIcon, ClockIcon, SparkIcon } from "@/components/ui/Icons";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { searchProducts } from "@/lib/filtering";
import { popularSearches } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { Skeleton } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";

/**
 * Command-style search overlay.
 * Mock search runs against the local data layer.
 * TODO(backend): swap `searchProducts` for `GET /api/search?q=`.
 */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen, recentSearches, pushRecentSearch, clearRecentSearches } =
    useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);

  const ref = useFocusTrap(searchOpen, () => setSearchOpen(false));
  useLockBodyScroll(searchOpen);

  /* Reset the query each time the overlay opens (render-phase reset). */
  const [wasOpen, setWasOpen] = useState(searchOpen);
  if (wasOpen !== searchOpen) {
    setWasOpen(searchOpen);
    if (searchOpen) setQuery("");
  }

  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
  }, [searchOpen]);

  const typing = query !== debounced;

  const results = useMemo(
    () => (debounced.trim() ? searchProducts(products, debounced).slice(0, 6) : []),
    [debounced],
  );

  const articleResults = useMemo(() => {
    const q = debounced.trim();
    if (!q) return [];
    return articles.filter((a) => (a.title + a.excerpt).includes(q)).slice(0, 2);
  }, [debounced]);

  const hasQuery = debounced.trim().length > 0;

  function submit(term: string) {
    const value = term.trim();
    if (!value) return;
    pushRecentSearch(value);
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(value)}`);
  }

  if (!searchOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[105]">
        <div
          className="absolute inset-0 bg-espresso-950/55 backdrop-blur-[3px] animate-fade-in"
          onClick={() => setSearchOpen(false)}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="جستجو در فروشگاه"
          className="absolute inset-x-0 top-0 mx-auto max-h-[100dvh] w-full max-w-3xl overflow-hidden bg-offwhite shadow-2xl animate-scale-in sm:top-6 sm:rounded-3xl"
        >
          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(query);
            }}
            className="flex items-center gap-3 border-b border-beige-300/70 px-5 py-4"
            role="search"
          >
            <SearchIcon className="size-5 shrink-0 text-ash-400" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام قهوه، خاستگاه، نت طعمی یا تجهیزات…"
              aria-label="عبارت جستجو"
              className="h-9 flex-1 bg-transparent text-base text-espresso-900 placeholder:text-ash-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="latin hidden rounded-md border border-beige-300 px-1.5 py-0.5 text-[0.65rem] text-ash-600 sm:block">
              ESC
            </kbd>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="بستن جستجو"
              className="flex size-9 items-center justify-center rounded-full text-espresso-800 transition hover:bg-espresso-900/6"
            >
              <XIcon className="size-5" />
            </button>
          </form>

          <div className="hide-scrollbar max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain p-5 sm:max-h-[70vh]">
            {!hasQuery ? (
              <div className="space-y-7">
                {recentSearches.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="flex items-center gap-2 text-xs font-bold text-espresso-900">
                        <ClockIcon className="size-4 text-ash-400" />
                        جستجوهای اخیر
                      </h2>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[0.7rem] text-ash-600 underline underline-offset-4 hover:text-danger"
                      >
                        پاک کردن
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => submit(term)}
                          className="rounded-full border border-espresso-900/12 px-3.5 py-1.5 text-xs text-espresso-800 transition hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-bold text-espresso-900">
                    <SparkIcon className="size-4 text-accent-500" />
                    جستجوهای پرطرفدار
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => submit(term)}
                        className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-medium text-espresso-800 transition hover:bg-espresso-900 hover:text-cream-50"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-xs font-bold text-espresso-900">دسته‌بندی‌ها</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.slice(0, 6).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/shop?category=${c.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="group flex items-center gap-3 rounded-2xl border border-beige-300/60 p-2 transition hover:border-espresso-900/30 hover:bg-cream-50"
                      >
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                          <Image src={c.image} alt="" fill sizes="44px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-espresso-900">
                            {c.title}
                          </span>
                          <span className="block truncate text-[0.65rem] text-ash-600">
                            {c.subtitle}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-xs font-bold text-espresso-900">پیشنهاد ما</h2>
                  <ul className="space-y-1">
                    {products.slice(0, 3).map((p) => (
                      <ResultRow key={p.id} product={p} onNavigate={() => setSearchOpen(false)} />
                    ))}
                  </ul>
                </section>
              </div>
            ) : typing ? (
              <ul className="space-y-2" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="size-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : results.length === 0 && articleResults.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-base font-bold text-espresso-900">
                  نتیجه‌ای برای «{debounced}» پیدا نشد
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm/7 text-ash-600">
                  املای عبارت را بررسی کنید یا یکی از جستجوهای پرطرفدار را امتحان کنید.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {popularSearches.slice(0, 4).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-medium text-espresso-800 transition hover:bg-espresso-900 hover:text-cream-50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {results.length > 0 && (
                  <section>
                    <h2 className="mb-2 text-xs font-bold text-espresso-900">محصولات</h2>
                    <ul className="space-y-1">
                      {results.map((p) => (
                        <ResultRow key={p.id} product={p} onNavigate={() => setSearchOpen(false)} />
                      ))}
                    </ul>
                  </section>
                )}

                {articleResults.length > 0 && (
                  <section>
                    <h2 className="mb-2 text-xs font-bold text-espresso-900">از ژورنال</h2>
                    <ul className="space-y-1">
                      {articleResults.map((a) => (
                        <li key={a.slug}>
                          <Link
                            href={`/journal/${a.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-cream-100"
                          >
                            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                              <Image src={a.image} alt="" fill sizes="48px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-espresso-900">
                                {a.title}
                              </span>
                              <span className="block truncate text-[0.7rem] text-ash-600">
                                {a.category}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <button
                  type="button"
                  onClick={() => submit(debounced)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso-900 py-3 text-sm font-semibold text-cream-50 transition hover:bg-espresso-800"
                >
                  مشاهده همه نتایج «{debounced}»
                  <ArrowUpLeftIcon className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

function ResultRow({
  product,
  onNavigate,
}: {
  product: (typeof products)[number];
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={`/product/${product.slug}`}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-2xl p-2 transition hover:bg-cream-100",
        )}
      >
        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-cream-100">
          <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-espresso-900">
            {product.title}
          </span>
          <span className="block truncate text-[0.7rem] text-ash-600">{product.tagline}</span>
        </span>
        <span className="shrink-0 text-xs font-bold text-espresso-900">
          {formatPrice(product.price)}
        </span>
      </Link>
    </li>
  );
}
