import type { Review, Testimonial } from "@/types";

/** MOCK DATA — product reviews. TODO(backend): `GET /api/products/:slug/reviews`. */
export const reviews: Review[] = [
  {
    id: "r-1",
    productSlug: "ethiopia-yirgacheffe",
    author: "سارا محمدی",
    rating: 5,
    date: "۱۴۰۴/۰۴/۱۲",
    title: "عطرش واقعاً متفاوت است",
    body: "به محض باز کردن بسته، بوی گل محمدی فضای آشپزخانه را پر کرد. با وی‌۶۰ دم کردم و شفافیت فنجان فوق‌العاده بود.",
    verified: true,
  },
  {
    id: "r-2",
    productSlug: "ethiopia-yirgacheffe",
    author: "امیر رستگار",
    rating: 4,
    date: "۱۴۰۴/۰۳/۲۸",
    title: "روشن و تمیز",
    body: "برای کسی که به قهوه تیره عادت دارد کمی سبک است، اما بعد از چند فنجان کاملاً جا می‌افتد.",
    verified: true,
  },
  {
    id: "r-3",
    productSlug: "ethiopia-yirgacheffe",
    author: "نگار کیانی",
    rating: 5,
    date: "۱۴۰۴/۰۳/۰۵",
    title: "ارسال سریع و بسته‌بندی عالی",
    body: "تاریخ رست فقط دو روز قبل از ارسال بود. همین تازگی تفاوت را می‌سازد.",
    verified: true,
  },
  {
    id: "r-4",
    productSlug: "signature-espresso",
    author: "پویا احمدی",
    rating: 5,
    date: "۱۴۰۴/۰۴/۰۲",
    title: "کرمای پایدار",
    body: "در کافه کوچکمان استفاده می‌کنیم. ثبات شات‌ها در طول روز عالی است.",
    verified: true,
  },
  {
    id: "r-5",
    productSlug: "signature-espresso",
    author: "مریم صادقی",
    rating: 4,
    date: "۱۴۰۴/۰۲/۱۹",
    title: "با شیر معرکه است",
    body: "برای کاپوچینو دقیقاً همان شیرینی کاراملی که دنبالش بودم.",
  },
  {
    id: "r-6",
    productSlug: "kenya-aa-nyeri",
    author: "حسین فتحی",
    rating: 5,
    date: "۱۴۰۴/۰۴/۲۱",
    title: "اسیدیته درخشان",
    body: "اگر عاشق قهوه‌های میوه‌ای هستید، این لات را از دست ندهید.",
    verified: true,
  },
  {
    id: "r-7",
    productSlug: "manual-grinder-pro",
    author: "الهام نوری",
    rating: 5,
    date: "۱۴۰۴/۰۱/۳۰",
    title: "کیفیت ساخت بی‌نظیر",
    body: "چرخش نرم و بدون لقی. یکنواختی آسیاب برای وی‌۶۰ کاملاً محسوس است.",
    verified: true,
  },
  {
    id: "r-8",
    productSlug: "colombia-huila",
    author: "رضا بهرامی",
    rating: 5,
    date: "۱۴۰۴/۰۴/۰۹",
    title: "انتخاب هر روز من",
    body: "متعادل و بدون تیزی. هم در فرنچ‌پرس هم در موکاپات خوب جواب می‌دهد.",
    verified: true,
  },
];

export function getReviewsForProduct(slug: string): Review[] {
  return reviews.filter((r) => r.productSlug === slug);
}

/** MOCK DATA — homepage testimonials. */
export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    author: "نیلوفر جهانی",
    role: "باریستا، کافه سی‌وسه",
    quote:
      "سه سال است قهوه بار ما را دربند تأمین می‌کند. ثبات پروفایل رست‌شان چیزی است که کمتر جایی دیده‌ام.",
    rating: 5,
  },
  {
    id: "t-2",
    author: "کاوه شریفی",
    role: "مشتری اشتراک ماهانه",
    quote:
      "هر ماه یک خاستگاه تازه در خانه‌ام است، با کارتی که توضیح می‌دهد چه می‌نوشم. تبدیل شده به آیین صبح‌های من.",
    rating: 5,
  },
  {
    id: "t-3",
    author: "شیما اکبری",
    role: "قهوه‌دوست خانگی",
    quote:
      "بخش «قهوه‌ات را پیدا کن» دقیقاً همان چیزی را پیشنهاد داد که دنبالش بودم. اولین بار بود خرید اینترنتی قهوه اشتباه نشد.",
    rating: 5,
  },
  {
    id: "t-4",
    author: "بابک مرادی",
    role: "مدیر کافه رست‌خانه",
    quote:
      "شفافیت اطلاعات مزرعه و تاریخ رست روی هر بسته، اعتماد را می‌سازد. کیفیت در حد بهترین رسترهای منطقه است.",
    rating: 5,
  },
];
