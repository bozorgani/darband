import type { Product } from "@/types";
import { finderFlavorMap, finderRoastMap, finderBrewMap } from "@/data/site";

export type FinderAnswers = Partial<Record<string, string>>;

export interface FinderMatch {
  product: Product;
  score: number;
  /** 0..100 — displayed as a match percentage. */
  match: number;
  reasons: string[];
}

/**
 * Pure recommendation scoring for the "قهوه‌ات را پیدا کن" module.
 * Deliberately deterministic and dependency-free so it can move
 * server-side later without behavioural change.
 */
export function recommendCoffee(
  products: Product[],
  answers: FinderAnswers,
  limit = 3,
): FinderMatch[] {
  const coffees = products.filter((p) => p.flavorNotes.length > 0);

  const scored = coffees.map((product) => {
    let score = 0;
    const reasons: string[] = [];

    // Brew method compatibility
    const brew = answers.brew ? finderBrewMap[answers.brew] : undefined;
    if (brew && product.brewMethods.includes(brew)) {
      score += 3;
      reasons.push("سازگار با روش دم‌آوری شما");
    }

    // Flavor family
    const family = answers.flavor ? finderFlavorMap[answers.flavor] ?? [] : [];
    const noteHits = product.flavorNotes.filter((n) => family.includes(n));
    if (noteHits.length) {
      score += noteHits.length * 2;
      reasons.push(`نت‌های ${noteHits.slice(0, 2).join(" و ")}`);
    }

    // Intensity → roast level
    const roasts = answers.intensity ? finderRoastMap[answers.intensity] ?? [] : [];
    if (product.roast && roasts.includes(product.roast)) {
      score += 2;
      reasons.push("شدت مطابق سلیقه شما");
    }

    // Acidity preference
    if (answers.acidity && product.acidity) {
      const target = answers.acidity === "low" ? 1.5 : answers.acidity === "medium" ? 3 : 4.5;
      const distance = Math.abs(product.acidity - target);
      score += Math.max(0, 2.5 - distance);
      if (distance <= 1) reasons.push("اسیدیته متناسب");
    }

    // Usage: daily → affordable & in stock, pro → high scoring lots
    if (answers.usage === "daily") {
      if (product.price <= 450_000) {
        score += 1.5;
        reasons.push("مناسب مصرف روزانه");
      }
    } else if (answers.usage === "pro") {
      if (product.categories.includes("specialty")) {
        score += 1.5;
        reasons.push("لات تخصصی با امتیاز بالا");
      }
      score += (product.rating - 4) * 2;
    }

    if (!product.inStock) score -= 4;

    return { product, score, reasons };
  });

  const max = Math.max(...scored.map((s) => s.score), 1);

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({
      ...s,
      match: Math.round(Math.min(98, 62 + (s.score / max) * 36)),
      reasons: s.reasons.slice(0, 3),
    }));
}
