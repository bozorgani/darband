"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BrewMethod, CategorySlug, ProductFilters, RoastLevel, SortKey } from "@/types";
import { allOrigins, priceBounds, products as allProducts } from "@/data/products";
import { brewLabels, categories, roastLabels } from "@/data/categories";
import { countActiveFilters, defaultFilters, filterProducts, sortProducts, sortOptions } from "@/lib/filtering";
import { ProductGrid } from "@/components/products/ProductCard";
import { ProductGridSkeleton, Checkbox, Badge } from "@/components/ui/Primitives";
import { EmptyState } from "@/components/ui/Feedback";
import { Drawer } from "@/components/ui/Overlay";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Disclosure";
import { FilterIcon, SearchIcon, XIcon, BeanIcon } from "@/components/ui/Icons";
import { formatNumber, toPersianDigits } from "@/lib/format";
import { useDebounced, useSimulatedLoading } from "@/hooks";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function ShopView() {
  const router = useRouter();
  const params = useSearchParams();

  const [filters, setFilters] = useState<ProductFilters>(() => ({
    ...defaultFilters,
    query: params.get("q") ?? "",
    categories: params.get("category") ? [params.get("category") as CategorySlug] : [],
  }));
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [queryInput, setQueryInput] = useState(filters.query);
  const debouncedQuery = useDebounced(queryInput, 250);

  /* Keep filters in sync with the URL (deep links from nav / search).
     Render-phase sync avoids a cascading effect render. */
  const urlQuery = params.get("q") ?? "";
  const urlCategory = params.get("category");
  const urlKey = `${urlQuery}|${urlCategory ?? ""}`;
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (lastUrlKey !== urlKey) {
    setLastUrlKey(urlKey);
    setFilters((f) => ({
      ...f,
      query: urlQuery,
      categories: urlCategory ? [urlCategory as CategorySlug] : [],
    }));
    setQueryInput(urlQuery);
    setPage(1);
  }

  const [lastQuery, setLastQuery] = useState(debouncedQuery);
  if (lastQuery !== debouncedQuery) {
    setLastQuery(debouncedQuery);
    setFilters((f) => (f.query === debouncedQuery ? f : { ...f, query: debouncedQuery }));
    setPage(1);
  }

  const filtered = useMemo(() => filterProducts(allProducts, filters), [filters]);
  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const loading = useSimulatedLoading([filters, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = countActiveFilters(filters);

  function update<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }

  function toggle<K extends "categories" | "roasts" | "origins" | "brewMethods">(
    key: K,
    value: ProductFilters[K][number],
  ) {
    setFilters((f) => {
      const list = f[key] as (typeof value)[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, [key]: next } as ProductFilters;
    });
    setPage(1);
  }

  function reset() {
    setFilters(defaultFilters);
    setQueryInput("");
    setSort("featured");
    setPage(1);
    router.replace("/shop");
  }

  const panel = (
    <FilterPanel
      filters={filters}
      onToggle={toggle}
      onUpdate={update}
      onReset={reset}
      activeCount={activeCount}
      results={sorted.length}
    />
  );

  return (
    <div className="container-page pb-20 pt-8 lg:pt-10">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ash-400" />
          <input
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="جستجو در محصولات…"
            aria-label="جستجو در محصولات"
            className="h-11 w-full rounded-full border border-espresso-900/15 bg-white/70 ps-11 pe-4 text-sm text-espresso-900 placeholder:text-ash-400 transition hover:border-espresso-900/30 focus:border-accent-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative inline-flex h-11 items-center gap-2 rounded-full border border-espresso-900/15 px-4 text-sm font-semibold text-espresso-900 transition hover:border-espresso-900 lg:hidden"
          >
            <FilterIcon className="size-4" />
            فیلترها
            {activeCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-accent-600 text-[0.65rem] font-bold text-white">
                {toPersianDigits(activeCount)}
              </span>
            )}
          </button>

          <div className="relative">
            <label htmlFor="sort" className="sr-only">
              مرتب‌سازی
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 appearance-none rounded-full border border-espresso-900/15 bg-white/70 ps-4 pe-10 text-sm font-semibold text-espresso-900 transition hover:border-espresso-900 focus:border-accent-600 focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-ash-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path d="m6 9.5 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[16rem_1fr] xl:grid-cols-[17rem_1fr] xl:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto hide-scrollbar pb-6">
            {panel}
          </div>
        </aside>

        {/* Results */}
        <section aria-live="polite" aria-busy={loading}>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <p className="text-sm text-ash-600">
              {loading
                ? "در حال به‌روزرسانی…"
                : `${toPersianDigits(sorted.length)} محصول یافت شد`}
            </p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-espresso-800 transition hover:bg-espresso-900 hover:text-cream-50"
              >
                حذف همه فیلترها
                <XIcon className="size-3" />
              </button>
            )}
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={<BeanIcon className="size-7" />}
              title="محصولی با این فیلترها پیدا نشد"
              description="فیلترها را ساده‌تر کنید یا عبارت جستجو را تغییر دهید تا نتایج بیشتری ببینید."
              secondary={
                <Button variant="outline" onClick={reset}>
                  بازنشانی فیلترها
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={pageItems} priorityCount={4} />
              <Pagination page={page} totalPages={totalPages} onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} />
            </>
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="فیلترها"
        description={`${toPersianDigits(sorted.length)} محصول`}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={reset}>
              بازنشانی
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>مشاهده نتایج</Button>
          </div>
        }
      >
        <div className="p-5">{panel}</div>
      </Drawer>
    </div>
  );
}

/* ------------------------------ Filter panel ------------------------------ */

function FilterPanel({
  filters,
  onToggle,
  onUpdate,
  onReset,
  activeCount,
  results,
}: {
  filters: ProductFilters;
  onToggle: <K extends "categories" | "roasts" | "origins" | "brewMethods">(
    key: K,
    value: ProductFilters[K][number],
  ) => void;
  onUpdate: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  onReset: () => void;
  activeCount: number;
  results: number;
}) {
  const countFor = (predicate: (p: (typeof allProducts)[number]) => boolean) =>
    allProducts.filter(predicate).length;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-espresso-900">
          فیلترها
          {activeCount > 0 && (
            <Badge tone="accent" className="ms-2">
              {toPersianDigits(activeCount)}
            </Badge>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-ash-600 underline underline-offset-4 transition hover:text-danger"
          >
            پاک کردن
          </button>
        )}
      </div>

      <FilterGroup title="دسته‌بندی">
        {categories.map((c) => (
          <Checkbox
            key={c.slug}
            label={c.title}
            count={countFor((p) => p.categories.includes(c.slug))}
            checked={filters.categories.includes(c.slug)}
            onChange={() => onToggle("categories", c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="درجه رست">
        {(Object.keys(roastLabels) as RoastLevel[]).map((r) => (
          <Checkbox
            key={r}
            label={roastLabels[r]}
            count={countFor((p) => p.roast === r)}
            checked={filters.roasts.includes(r)}
            onChange={() => onToggle("roasts", r)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="خاستگاه">
        {allOrigins.map((o) => (
          <Checkbox
            key={o}
            label={o}
            count={countFor((p) => p.origin?.country === o)}
            checked={filters.origins.includes(o)}
            onChange={() => onToggle("origins", o)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="روش دم‌آوری">
        {(Object.keys(brewLabels) as BrewMethod[]).map((b) => (
          <Checkbox
            key={b}
            label={brewLabels[b]}
            count={countFor((p) => p.brewMethods.includes(b))}
            checked={filters.brewMethods.includes(b)}
            onChange={() => onToggle("brewMethods", b)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="محدوده قیمت">
        <div className="pt-1">
          <div className="mb-3 flex items-center justify-between text-xs text-ash-600">
            <span>{formatNumber(priceBounds.min)}</span>
            <span className="font-semibold text-espresso-900">
              تا {formatNumber(filters.priceMax)} تومان
            </span>
          </div>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={50_000}
            value={filters.priceMax}
            onChange={(e) => onUpdate("priceMax", Number(e.target.value))}
            aria-label="حداکثر قیمت"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-beige-300 accent-espresso-900 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-espresso-900"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="امتیاز">
        <div className="flex flex-wrap gap-2 pt-1">
          {[0, 4, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onUpdate("minRating", r)}
              aria-pressed={filters.minRating === r}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                filters.minRating === r
                  ? "border-espresso-900 bg-espresso-900 text-cream-50"
                  : "border-espresso-900/15 text-espresso-800 hover:border-espresso-900/45",
              )}
            >
              {r === 0 ? "همه" : `${toPersianDigits(r)}+`}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="موجودی">
        <Checkbox
          label="فقط کالاهای موجود"
          checked={filters.inStockOnly}
          onChange={(v) => onUpdate("inStockOnly", v)}
        />
      </FilterGroup>

      <p className="border-t border-beige-300/70 pt-4 text-xs text-ash-600">
        {toPersianDigits(results)} محصول مطابق فیلترهای فعلی
      </p>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-espresso-900">
        {title}
      </legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}
