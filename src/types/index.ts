/**
 * Domain types for the Darband storefront.
 *
 * NOTE: This shape mirrors what a real commerce backend would return.
 * The UI reads exclusively through `src/data/*` so a real API can be
 * swapped in later without touching components.
 */

export type RoastLevel = "light" | "medium" | "medium-dark" | "dark";

export type BrewMethod =
  | "espresso"
  | "v60"
  | "french-press"
  | "aeropress"
  | "moka"
  | "chemex";

export type CategorySlug =
  | "whole-bean"
  | "ground"
  | "espresso"
  | "specialty"
  | "blend"
  | "capsule"
  | "equipment"
  | "accessories"
  | "gift";

export interface Category {
  slug: CategorySlug;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  /** Editorial layout weight on the homepage grid. */
  featured?: boolean;
}

export interface ProductVariantGroup {
  id: "form" | "weight" | "grind";
  label: string;
  options: ProductVariantOption[];
}

export interface ProductVariantOption {
  id: string;
  label: string;
  /** Price delta in Toman, added to the base price. */
  priceDelta?: number;
  disabled?: boolean;
}

export interface ProductOrigin {
  country: string;
  region?: string;
  farm?: string;
  altitude?: string;
  process?: string;
  varietal?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  longDescription: string[];
  category: CategorySlug;
  categories: CategorySlug[];
  price: number;
  compareAtPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  origin?: ProductOrigin;
  roast?: RoastLevel;
  /** 1..5 */
  intensity?: number;
  /** 1..5 */
  acidity?: number;
  flavorNotes: string[];
  brewMethods: BrewMethod[];
  badges?: string[];
  inStock: boolean;
  stockCount?: number;
  bestSeller?: boolean;
  featured?: boolean;
  isNew?: boolean;
  variants?: ProductVariantGroup[];
  brewingTip?: string;
  specs?: { label: string; value: string }[];
}

export interface Review {
  id: string;
  productSlug: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified?: boolean;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  quote: string;
  rating: number;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  date: string;
  readingTime: number;
  author: string;
  featured?: boolean;
  body: { heading?: string; paragraphs: string[] }[];
}

/* --------------------------------- Cart --------------------------------- */

export interface CartItem {
  /** Stable composite key: productId + selected variants. */
  key: string;
  productId: string;
  slug: string;
  title: string;
  image: string;
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  options: { label: string; value: string }[];
}

export interface DiscountCode {
  code: string;
  /** 0..1 */
  percentage: number;
  label: string;
}

/* ------------------------------- Filtering ------------------------------ */

export interface ProductFilters {
  query: string;
  categories: CategorySlug[];
  roasts: RoastLevel[];
  origins: string[];
  brewMethods: BrewMethod[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  inStockOnly: boolean;
}

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";
