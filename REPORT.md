# دربند — گزارش نهایی پروژه / Final Report

**پروژه:** فروشگاه آنلاین قهوهٔ تخصصی «دربند» (DARBAND Roasters)
**نوع:** Frontend-only، بدون بک‌اند واقعی
**استک:** Next.js 16.3.4 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
**تاریخ:** ۱۴۰۴ / 2026-09-01

---

## ۱. چه چیزی ساخته شد

### صفحات (۴۳ مسیر پیش‌رندر شده)

| مسیر | محتوا |
|---|---|
| `/` | Hero، نوار اعتماد، محصولات منتخب، دسته‌بندی‌ها، داستان قهوه، پرفروش‌ها، **کوییز تعاملی «قهوه‌ات را پیدا کن»** (۵ مرحله)، اشتراک ماهانه، نظرات مشتریان، گالری لایف‌استایل، تیزر ژورنال، خبرنامه، فوتر کامل |
| `/shop` | گرید محصولات + سایدبار فیلتر دسکتاپ / کشوی موبایل، مرتب‌سازی، جست‌وجوی درون‌صفحه‌ای، فیلتر دسته‌بندی، بازهٔ قیمت، درجهٔ رست، خاستگاه، روش دم‌آوری، موجودی، امتیاز؛ وضعیت خالی + ریست فیلتر |
| `/product/[slug]` | گالری با زوم، بندانگشتی و سوایپ موبایل، اطلاعات کامل، انتخاب نوع/وزن/آسیاب/تعداد، افزودن به سبد + خرید سریع + علاقه‌مندی، پروفایل طعمی، آکاردئون اطلاعات، نظرات، راهنمای دم‌آوری تب‌دار، محصولات مرتبط |
| `/cart` | صفحهٔ سبد + کشوی سبد، تغییر تعداد، حذف، کد تخفیف، خلاصهٔ سفارش، ارسال رایگان بالای ۱٬۵۰۰٬۰۰۰ تومان، وضعیت خالی |
| `/wishlist` | لیست علاقه‌مندی‌ها، افزودن گروهی به سبد، وضعیت خالی |
| `/about` | صفحهٔ ادیتوریال (داستان، ارزش‌ها، تیم، آمار، رُستری) |
| `/journal` + `/journal/[slug]` | مقالهٔ شاخص، گرید مقالات، دسته‌بندی، جست‌وجو، تگ‌ها، صفحهٔ مقاله با مقالات مرتبط |
| `/[page]` | ۸ صفحهٔ اطلاعاتی ایستا (ارسال، بازگشت کالا، سوالات متداول، تماس، حریم خصوصی، …) |
| `sitemap.xml`, `robots.txt`, `not-found`, `error`, `loading` | زیرساخت مسیرها |

پوشش سراسری: **اورلی جست‌وجو** (⌘/Ctrl+K، جست‌وجوهای اخیر، محبوب، پیشنهاد، دسته‌بندی، وضعیت خالی)، **کشوی سبد**، **نویگیشن موبایل** با زیرمنو، **توست‌ها**، **اسکیپ‌لینک**.

### دیزاین‌سیستم (اول طراحی، بعد پیاده‌سازی)
- پالت: espresso / coffee / beige / cream / offwhite / ash + آکسنت مسی `#a8642c` — همه در `@theme` تیلویند v4.
- تایپوگرافی: Vazirmatn متغیر (self-hosted، `next/font/local`) با مقیاس Display / H1–H3 / Body / Caption / Label.
- کامپوننت‌های قابل استفادهٔ مجدد: `Button`, `Input`, `Select`, `Checkbox`, `Badge`, `Rating`, `Price`, `ProductCard`, `ProductGrid`, `Modal`, `Drawer`, `Toast`, `Tabs`, `Accordion`, `Breadcrumb`, `Pagination`, `Skeleton`, `EmptyState`, `Reveal`.

### کیفیت
- **RTL کامل** با اعداد و قیمت فارسی (`۴۸۵,۰۰۰ تومان`) — گروه‌بندی لاتین سپس نگاشت ارقام (نه `toLocaleString`).
- **ریسپانسیو** تأیید شده در ۳۷۵ / ۳۹۰ / ۷۶۸ / ۱۰۲۴ / ۱۲۸۰ / ۱۴۴۰ روی ۱۲ صفحه: **بدون سرریز افقی، بدون خطای کنسول**.
- **حالت‌ها:** اسکلتون واقعی، خالی، خطا، موفقیت (توست)، هاور، فوکوس.
- **دسترس‌پذیری:** HTML معنایی، اسکیپ‌لینک به‌عنوان اولین توقف Tab، فوکوس‌تراپ در مودال/کشوها، بستن با Escape، `aria-label`/`aria-live`، دکمه‌های واقعی، متن جایگزین تصاویر، کنتراست مناسب، احترام به `prefers-reduced-motion`.
- **کارایی:** تفکیک درست Server/Client Component، `next/image` با `sizes` و AVIF/WebP، `priority` فقط برای LCP، لیزی‌لود بقیه، فونت self-host بدون درخواست شبکه در بیلد.
- **SEO:** متادیتای هر صفحه، canonical، OG/Twitter، سلسله‌مراتب هدینگ، بردکرامب، JSON-LD برای Organization و Product، sitemap و robots. صفحهٔ فروشگاه محصولات را **سمت سرور** هم رندر می‌کند تا خزنده‌های بدون JS کاتالوگ را ببینند.

---

## ۲. معماری و فایل‌های کلیدی

```
src/
  app/            layout, page, shop, product/[slug], cart, wishlist,
                  about, journal(+[slug]), [page], sitemap, robots,
                  not-found, error, loading, globals.css, fonts/
  components/
    ui/           Button, Primitives, Overlay, Disclosure, Feedback, Icons, Reveal
    layout/       AppShell, Header, Logo, MobileNav, Footer
    products/     ProductCard(+Grid), ShopView, ProductGallery, ProductPurchase, BrewingGuide
    home/         Hero, TrustStrip, FeaturedProducts, CategoryShowcase, CoffeeStory,
                  BestSellers, CoffeeFinder, Subscription, Testimonials, Gallery, JournalTeaser
    cart/ wishlist/ journal/ search/
  data/           products.ts (۱۸ محصول), categories, reviews, articles, site, pages
  lib/            format, utils, filtering, finder
  hooks/          useIsMounted, usePersistentState, useReveal, useMediaQuery,
                  useLockBodyScroll, useScrollState, useFocusTrap, useDebounced, useSimulatedLoading
  store/          store.tsx (سبد/علاقه‌مندی/جست‌وجو), toast.tsx
  types/index.ts
qa/               flows.cjs, overflow.cjs, shots.cjs, hyd.cjs  (اسکریپت‌های QA با Playwright)
```

- تمام دادهٔ ماک در `src/data/` ایزوله شده تا با یک لایهٔ API واقعی جایگزین شود.
- مدیریت state با React Context + `useReducer`/`useState` + `localStorage` (`darband.cart.v1`, `.wishlist.v1`, `.searches.v1`). **هیچ وابستگی اضافه‌ای** نصب نشده (تنها devDependency اضافه: `playwright` برای QA).

---

## ۳. آنچه ماک شده و برای تولید نیاز به بک‌اند دارد

هر مورد در کد با `// TODO(backend):` علامت‌گذاری شده و پشت یک تابع با امضای مشخص است:

| قابلیت | وضعیت فعلی | نیاز واقعی |
|---|---|---|
| کاتالوگ محصولات / مقالات | آرایه‌های تایپ‌شده در `src/data/` | `GET /api/products`, `/api/articles` |
| جست‌وجو و فیلتر | کلاینت‌ساید روی همان آرایه‌ها | جست‌وجوی سمت سرور + صفحه‌بندی |
| سبد خرید و علاقه‌مندی | Context + localStorage | سبد سمت سرور / حساب کاربری |
| کد تخفیف (`DARBAND10`، `FILTER20`) | اعتبارسنجی محلی | اعتبارسنجی سرور |
| تسویه‌حساب و پرداخت | دکمه + توست شبیه‌سازی‌شده | درگاه پرداخت |
| خبرنامه و فرم تماس | شبیه‌سازی موفقیت | سرویس ایمیل |
| ثبت نظر | فرم غیرفعال/شبیه‌سازی | API نظرات + احراز هویت |
| شروع اشتراک ماهانه | توست | پرداخت دوره‌ای |
| امتیازدهی کوییز قهوه | تابع محلی `lib/finder.ts` | می‌تواند همین بماند یا سروری شود |
| محتوای صفحات ایستا | `data/pages.ts` | CMS |
| گزارش خطا | `console.error` در `error.tsx` | Sentry یا مشابه |

---

## ۴. نتایج بیلد، لینت و تست

| بررسی | دستور | نتیجه |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ بدون خطا |
| Lint | `npx eslint src` | ✅ **۰ خطا، ۰ هشدار** |
| Build | `npm run build` | ✅ موفق — **۴۳ مسیر** پیش‌رندر (Static/SSG) |
| تست تعاملی | `node qa/flows.cjs` | ✅ **۲۹/۲۹ PASS، ۰ شکست** (روی بیلد پروداکشن) |
| سرریز/کنسول | `node qa/overflow.cjs` | ✅ CLEAN — ۶ بریک‌پوینت × ۱۲ صفحه |
| هیدریشن/کنسول | `node qa/hyd.cjs` | ✅ بدون خطا |

پوشش تست تعاملی (۲۹ بررسی): خانه→فروشگاه، فیلتر رست (۱۲→۳)، مرتب‌سازی، ریست، جست‌وجوی درون‌صفحه، فروشگاه→محصول، انتخاب نوع+تعداد+افزودن به سبد (بج ۲ + توست)، علاقه‌مندی، باز شدن کشوی سبد، افزایش تعداد، رفتن به صفحهٔ سبد، کد تخفیف معتبر و نامعتبر، خالی شدن سبد، صفحهٔ علاقه‌مندی + افزودن گروهی، اورلی جست‌وجو (نتیجه/خالی/Escape)، کوییز ۵ مرحله‌ای، اسکیپ‌لینک، کشوی نویگیشن موبایل + زیرمنو، کشوی فیلتر موبایل، افزودن سریع موبایل، و شمارش خطاهای صفحه در دسکتاپ و موبایل.

**باگ‌هایی که در جریان QA پیدا و رفع شدند:** فراخوانی `toast()` داخل updater ناخالص در `store.tsx`؛ `setState` والد در فاز رندر در `MobileNav.tsx`؛ نبود `relative` روی والد تصویر `fill` در `Gallery.tsx`؛ ترتیب لوگو در هدر دسکتاپ RTL؛ `pointer-events` روی آیکن چک‌باکس؛ `priority` برای تصویر LCP.

---

## ۵. مسائل باقی‌مانده

1. **۱۰ تصویر جای‌گیر** هنوز کپی `hero.jpg` هستند و باید با تصویر اختصاصی جایگزین شوند (سهمیهٔ تولید تصویر در این نوبت تمام شد):
   `products/{v60-1, frenchpress-1, gift-1, filter-1}.jpg`، `story.jpg`، `roastery.jpg`، `lifestyle/{1,2,3,4}.jpg`.
   همچنین «پاناما گیشا» فعلاً از تصویر اتیوپی استفاده می‌کند.
2. **هشدار LCP در حالت dev** روی صفحهٔ محصول: مثبت کاذب ناشی از همین اشتراک فایل تصویر بین محصول اصلی و کارت محصول مرتبط؛ با تصاویر اختصاصی برطرف می‌شود. در پروداکشن اثری ندارد.
3. **`qa/` و وابستگی `playwright`** عمداً نگه داشته شده‌اند (اسکریپت‌های تست تعاملی و اسکرین‌شات). اگر مخزن باید مینیمال بماند، حذفشان بی‌خطر است.
4. تسویه‌حساب عمداً به بک‌اند وصل نیست؛ آخرین گام یک توست است.
