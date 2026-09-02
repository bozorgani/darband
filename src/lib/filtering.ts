import type { Product, ProductFilters, SortKey } from "@/types";
import { normalizeText } from "./utils";
import { priceBounds } from "@/data/products";

export const defaultFilters: ProductFilters = {
  query: "",
  categories: [],
  roasts: [],
  origins: [],
  brewMethods: [],
  priceMin: priceBounds.min,
  priceMax: priceBounds.max,
  minRating: 0,
  inStockOnly: false,
};

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "پیشنهاد قهوینو" },
  { key: "newest", label: "جدیدترین" },
  { key: "price-asc", label: "ارزان‌ترین" },
  { key: "price-desc", label: "گران‌ترین" },
  { key: "rating", label: "بیشترین امتیاز" },
];

/** Pure search — used by both the shop page and the search overlay. */
export function searchProducts(items: Product[], query: string): Product[] {
  const q = normalizeText(query);
  if (!q) return items;
  const terms = q.split(" ").filter(Boolean);
  return items.filter((p) => {
    const haystack = normalizeText(
      [
        p.title,
        p.tagline,
        p.description,
        p.origin?.country ?? "",
        p.origin?.region ?? "",
        ...p.flavorNotes,
        ...p.categories,
      ].join(" "),
    );
    return terms.every((t) => haystack.includes(t));
  });
}

export function filterProducts(
  items: Product[],
  filters: ProductFilters,
): Product[] {
  let result = searchProducts(items, filters.query);

  if (filters.categories.length) {
    result = result.filter((p) =>
      p.categories.some((c) => filters.categories.includes(c)),
    );
  }
  if (filters.roasts.length) {
    result = result.filter((p) => p.roast && filters.roasts.includes(p.roast));
  }
  if (filters.origins.length) {
    result = result.filter(
      (p) => p.origin?.country && filters.origins.includes(p.origin.country),
    );
  }
  if (filters.brewMethods.length) {
    result = result.filter((p) =>
      p.brewMethods.some((b) => filters.brewMethods.includes(b)),
    );
  }
  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }
  if (filters.minRating > 0) {
    result = result.filter((p) => p.rating >= filters.minRating);
  }
  result = result.filter(
    (p) => p.price >= filters.priceMin && p.price <= filters.priceMax,
  );

  return result;
}

export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    default:
      return copy.sort(
        (a, b) =>
          Number(!!b.featured) - Number(!!a.featured) ||
          Number(!!b.bestSeller) - Number(!!a.bestSeller) ||
          b.rating - a.rating,
      );
  }
}

export function countActiveFilters(filters: ProductFilters): number {
  return (
    filters.categories.length +
    filters.roasts.length +
    filters.origins.length +
    filters.brewMethods.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.priceMax < priceBounds.max || filters.priceMin > priceBounds.min
      ? 1
      : 0)
  );
}
