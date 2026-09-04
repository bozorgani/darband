# قهوینو — Ghahvino

فروشگاه آنلاین قهوهٔ تخصصی، تمام‌فارسی و RTL. **Frontend-only**: تمام داده‌ها ماک و ایزوله در `src/data/` هستند.

دامنه کانونی: `https://ghahvino.ir`

## اجرا

```bash
npm install
cp .env.example .env.local   # فقط NEXT_PUBLIC_SITE_URL
npm run dev      # http://localhost:3000
npm run build && npx next start
```

## پیکربندی

هویت برند، دامنه کانونی و زبان تنها در `src/config/site.ts` تعریف شده‌اند و متادیتا،
canonical، `sitemap.xml`، `robots.txt`، Open Graph و JSON-LD از همان‌جا تغذیه می‌شوند.
با `NEXT_PUBLIC_SITE_URL` می‌توان دامنه را برای محیط‌های staging عوض کرد؛ مقدار نامعتبر یا
`localhost` در پروداکشن نادیده گرفته می‌شود و `https://ghahvino.ir` جای‌گزین می‌گردد.

## حساب کاربری و ورود (نمایشی)

ورود فقط با **شماره موبایل ایران** و کد یک‌بارمصرف انجام می‌شود. همه‌چیز Mock است و هیچ سرویس
پیامک یا احراز هویت واقعی در کار نیست.

| مورد | مقدار |
|---|---|
| کد OTP نمایشی | `12345` |
| کاربر موجود | `09121234567` → مستقیم وارد پنل می‌شود |
| کاربر جدید | `09120000000` → مرحله تکمیل پروفایل |

فرمت‌های پذیرفته‌شده هنگام تایپ یا Paste: `09121234567`، `9121234567`، `+989121234567`،
`00989121234567` به‌همراه ارقام فارسی/عربی، فاصله، خط تیره و پرانتز. همه به فرمت داخلی
`+989121234567` نرمال می‌شوند و در UI به شکل محلی (`۰۹۱۲ ۱۲۳ ۴۵۶۷`) دیده می‌شوند.
هر شماره موبایل معتبر ایرانی دیگری هم به‌عنوان «کاربر جدید» پذیرفته می‌شود.

اگر کاربر تازه‌ثبت‌نام‌شده وسط مرحلهٔ تکمیل پروفایل صفحه را Refresh کند، همان مرحله دوباره
نمایش داده می‌شود (وضعیت از روی نشست محاسبه می‌شود، نه از State کامپوننت).
مقصد بعد از ورود (`?next=`) فقط اگر مسیر داخلی `/account` یا `/account/*` باشد اعمال می‌شود؛
هر مقصد دیگری به `/account` تبدیل می‌شود. نشست ورود در
`localStorage` نگهداری می‌شود و **امنیت واقعی ندارد**.

## بررسی کیفیت

```bash
npx tsc --noEmit     # type-check
npx eslint src       # lint (Next 16 دیگر next lint ندارد)
node qa/flows.cjs      # ۲۹ سناریوی تعاملی فروشگاه (سرور باید بالا باشد)
node qa/auth.cjs       # ۵۵ سناریوی ورود/OTP/پنل کاربری
node qa/seo.cjs        # ۳۵ بررسی سئو روی HTML پروداکشن (متادیتا، sitemap، JSON-LD، لینک‌ها)
node qa/responsive.cjs # ۸ صفحه × ۹ عرض: سرریز، لوگو، منوی موبایل، خطای کنسول
node qa/overflow.cjs   # سرریز افقی + خطای کنسول در ۶ بریک‌پوینت
node qa/shots.cjs      # اسکرین‌شات تمام‌صفحه از ۸ صفحه × ۲ ویوپورت
```

استک: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vazirmatn (self-hosted).

## PWA

Manifest فارسی، نصب اختیاری، راهنمای iOS، fallback آفلاین و آپدیت با رضایت کاربر اضافه شده‌اند.
Worker فقط در Production ثبت می‌شود. همیشه `npm run build` و سپس `npm start` را اجرا کنید؛
Build، فایل `public/sw.js` را از `src/pwa/worker.js` با نسخهٔ مخصوص همان انتشار تولید می‌کند.
اجرای مستقیم `next build` مرحلهٔ بسته‌بندی Worker را انجام نمی‌دهد.

```bash
node qa/pwa-worker.cjs # امنیت، انقضا و محدودیت کش
node qa/pwa.cjs        # نصب، آفلاین و دو نسخهٔ واقعی Worker
```

Auth، Account، Cart، Wishlist، Checkout، Payment و API وارد کش Worker نمی‌شوند.
قیمت و موجودی آفلاین قطعی نیست؛ خرید و ورود به شبکه نیاز دارند. Push و Background Sync اضافه نشده‌اند.
دستورهای عملیاتی در [RUN.md](./RUN.md) و نتایج و محدودیت‌ها در
[PWA_IMPLEMENTATION_REPORT.md](./PWA_IMPLEMENTATION_REPORT.md) آمده‌اند.

گزارش کامل پروژه: [`REPORT.md`](./REPORT.md) · گزارش ورود: [`REPORT-AUTH.md`](./REPORT-AUTH.md) ·
ممیزی ری‌برند/سئو/ریسپانسیو: [`RESPONSIVE_SEO_AUDIT.md`](./RESPONSIVE_SEO_AUDIT.md)
