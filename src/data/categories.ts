import type { Category } from "@/types";

/**
 * MOCK DATA — categories.
 * TODO(backend): replace with `GET /api/categories`.
 */
export const categories: Category[] = [
  {
    slug: "whole-bean",
    title: "قهوه دانه",
    subtitle: "تازه‌ رست‌شده",
    description:
      "دانه‌های تک‌خاستگاه که در روز سفارش رست می‌شوند تا عطرشان دست‌نخورده به فنجان شما برسد.",
    image: "/images/products/ethiopia-1.jpg",
    featured: true,
  },
  {
    slug: "ground",
    title: "قهوه آسیاب‌شده",
    subtitle: "آماده دم‌آوری",
    description:
      "آسیاب دقیق بر اساس روش دم‌آوری شما؛ از درشت فرنچ‌پرس تا ریز اسپرسو.",
    image: "/images/products/ethiopia-2.jpg",
  },
  {
    slug: "espresso",
    title: "اسپرسو",
    subtitle: "کرمای پایدار",
    description:
      "ترکیب‌هایی که برای فشار ۹ بار طراحی شده‌اند؛ شکلاتی، متعادل و با بدنه‌ای سنگین.",
    image: "/images/products/espresso-1.jpg",
    featured: true,
  },
  {
    slug: "specialty",
    title: "قهوه تخصصی",
    subtitle: "امتیاز بالای ۸۵",
    description:
      "لات‌های محدود از مزارع منتخب، با پروفایل طعمی روشن و مستندات کامل خاستگاه.",
    image: "/images/products/kenya-1.jpg",
    featured: true,
  },
  {
    slug: "blend",
    title: "قهوه ترکیبی",
    subtitle: "امضای دربند",
    description: "ترکیب‌های خانگی ما؛ ساخته‌شده برای تکرارپذیری هر روز صبح.",
    image: "/images/products/blend-1.jpg",
  },
  {
    slug: "capsule",
    title: "کپسول قهوه",
    subtitle: "سازگار با نسپرسو",
    description: "همان کیفیت تخصصی، در سریع‌ترین شکل ممکن.",
    image: "/images/products/capsules-1.jpg",
  },
  {
    slug: "equipment",
    title: "تجهیزات دم‌آوری",
    subtitle: "ابزار حرفه‌ای",
    description: "آسیاب، دریپر، فرنچ‌پرس و هر آنچه برای یک فنجان دقیق لازم است.",
    image: "/images/products/grinder-1.jpg",
    featured: true,
  },
  {
    slug: "accessories",
    title: "فیلتر و لوازم جانبی",
    subtitle: "جزئیات مهم‌اند",
    description: "فیلتر کاغذی، ترازو، کتری گردن‌غازی و لوازم مصرفی روزمره.",
    image: "/images/products/filter-1.jpg",
  },
  {
    slug: "gift",
    title: "محصولات هدیه",
    subtitle: "بسته‌بندی ویژه",
    description: "جعبه‌های کشف طعم و ست‌های هدیه، آماده برای تقدیم.",
    image: "/images/products/gift-1.jpg",
    featured: true,
  },
];

export const categoryMap = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string) {
  return categoryMap.get(slug as Category["slug"]);
}

export const roastLabels: Record<string, string> = {
  light: "رست روشن",
  medium: "رست متوسط",
  "medium-dark": "رست متوسط تیره",
  dark: "رست تیره",
};

export const brewLabels: Record<string, string> = {
  espresso: "اسپرسو",
  v60: "وی‌۶۰",
  "french-press": "فرنچ‌پرس",
  aeropress: "ایروپرس",
  moka: "موکاپات",
  chemex: "کمکس",
};
