# راهنمای اجرای پروژهٔ دربند

پروژه **فرانت‌اند خالص** است: نه دیتابیس دارد، نه فایل `.env`، نه سرویس جانبی. فقط Node.js لازم است.

---

## ۰. پیش‌نیازها

| مورد | نسخهٔ لازم | بررسی |
|---|---|---|
| Node.js | **۲۰.۹ یا بالاتر** (تست‌شده روی `v20.20.2`) | `node -v` |
| npm | ۱۰ یا بالاتر | `npm -v` |

اگر نسخهٔ Node قدیمی است، با [nvm](https://github.com/nvm-sh/nvm) عوض کنید:

```bash
nvm install 20 && nvm use 20
```

---

## ۱. نصب وابستگی‌ها (یک‌بار)

```bash
cd darband
npm install
```

وابستگی‌های اصلی فقط `next`, `react`, `react-dom` هستند. فونت Vazirmatn داخل مخزن قرار دارد
(`src/app/fonts/Vazirmatn.woff2`)، پس بیلد به اینترنت نیاز ندارد.

---

## ۲. حالت توسعه (Development)

```bash
npm run dev
```

سپس مرورگر را روی <http://localhost:3000> باز کنید.

- Hot Reload فعال است؛ هر تغییری در `src/` بلافاصله اعمال می‌شود.
- برای در دسترس بودن روی شبکهٔ محلی (مثلاً تست روی موبایل):
  ```bash
  npx next dev -H 0.0.0.0 -p 3000
  ```
  بعد از گوشی به `http://<IP-کامپیوتر>:3000` وصل شوید.

> نکته: در حالت dev، React StrictMode کامپوننت‌ها را دوبار رندر می‌کند؛ به همین دلیل ممکن است
> در صفحهٔ فروشگاه یک لحظه اسکلتون لودینگ ببینید. در بیلد پروداکشن این اتفاق نمی‌افتد.

---

## ۳. حالت پروداکشن (همان چیزی که الان در پیش‌نمایش می‌بینید)

```bash
npm run build     # ۴۳ مسیر به‌صورت استاتیک پیش‌رندر می‌شود
npm start         # یا: npx next start -H 0.0.0.0 -p 3000
```

خروجی بیلد در `.next/` ساخته می‌شود (این پوشه نباید در گیت کامیت شود).

### تغییر پورت

```bash
npm start -- -p 4000        # یا  PORT=4000 npm start
```

---

## ۴. بررسی کیفیت کد

```bash
npx tsc --noEmit     # بررسی تایپ — باید بدون خروجی تمام شود
npx eslint src       # لینت — ۰ خطا، ۰ هشدار
```

> در Next 16 دستور `next lint` حذف شده است؛ مستقیم از `eslint` استفاده کنید.

---

## ۵. اجرای تست‌های QA (اختیاری)

اسکریپت‌های Playwright در پوشهٔ `qa/` هستند. **سرور باید از قبل روی پورت ۳۰۰۰ بالا باشد.**

```bash
# یک‌بار: نصب مرورگر
npx playwright install chromium

# در ترمینال اول
npm start

# در ترمینال دوم
node qa/flows.cjs      # ۲۹ سناریوی تعاملی فروشگاه → باید «0 failures» بدهد
node qa/auth.cjs       # ۴۲ سناریوی ورود با OTP و پنل کاربری
node qa/overflow.cjs   # سرریز افقی و خطای کنسول در ۶ بریک‌پوینت × ۱۲ صفحه
node qa/hyd.cjs        # خطاهای کنسول/هیدریشن
node qa/shots.cjs      # اسکرین‌شات تمام‌صفحه از ۸ صفحه × ۲ ویوپورت
```

اگر پوشهٔ `qa/` را لازم ندارید، حذفش بی‌خطر است:
`rm -rf qa && npm uninstall playwright`

---

## ۶. استقرار (Deploy)

چون همه‌چیز استاتیک است، هر جایی که Next.js را اجرا کند کار می‌کند:

- **Vercel:** مخزن را وصل کنید؛ بدون هیچ تنظیم اضافه‌ای بیلد می‌شود.
- **هر سرور Node:** `npm ci && npm run build && npm start` (پشت Nginx یا PM2).
- **هاست استاتیک:** با افزودن `output: "export"` به `next.config.ts` و اجرای `npm run build`،
  خروجی HTML خالص در `out/` تولید می‌شود. توجه: در این حالت بهینه‌سازی تصویر Next غیرفعال
  می‌شود و باید `images.unoptimized = true` را هم ست کنید.

قبل از استقرار واقعی، دامنه را در `metadataBase` داخل `src/app/layout.tsx`
(الان `https://darband.coffee`) و در `src/app/sitemap.ts` به‌روزرسانی کنید.

---

## ۷. جاهایی که برای تغییر محتوا باید سراغشان بروید

| می‌خواهید چه چیزی را عوض کنید | فایل |
|---|---|
| محصولات (۱۸ عدد) | `src/data/products.ts` |
| دسته‌بندی‌ها | `src/data/categories.ts` |
| مقالات ژورنال | `src/data/articles.ts` |
| نظرات مشتریان | `src/data/reviews.ts` |
| نام برند، منو، شبکه‌های اجتماعی، اطلاعات تماس | `src/data/site.ts` |
| متن صفحات ایستا (ارسال، بازگشت، سوالات متداول…) | `src/data/pages.ts` |
| رنگ‌ها، فونت و مقیاس تایپوگرافی | `src/app/globals.css` (بلوک `@theme`) |
| آستانهٔ ارسال رایگان، هزینهٔ ارسال، کدهای تخفیف | `src/store/store.tsx` |
| تصاویر | `public/images/` |
| کاربر، سفارش‌ها، نشانی‌ها و اعلان‌های نمایشی | `src/data/mock-user.ts` |
| کد OTP نمایشی و قواعد آن | `src/features/auth/auth.service.ts` |
| نرمال‌سازی شماره موبایل و کامل‌بودن پروفایل | `src/features/auth/auth.utils.ts` |
| سیاست Redirect امن بعد از ورود | `src/features/auth/redirect.ts` |

---

## ۸. رفع اشکالات رایج

| مشکل | راه‌حل |
|---|---|
| `Error: listen EADDRINUSE :::3000` | پورت اشغال است: `npx next start -p 3001` یا `lsof -ti:3000 \| xargs kill` |
| صفحه بدون استایل بالا می‌آید | `rm -rf .next && npm run build` |
| خطای عجیب بعد از عوض کردن نسخهٔ Node | `rm -rf node_modules package-lock.json && npm install` |
| `require("playwright")` پیدا نمی‌شود | اسکریپت‌های QA باید از داخل پوشهٔ پروژه اجرا شوند، نه از `/tmp` |
| متن‌ها چپ‌چین شده‌اند | `dir="rtl"` روی `<html>` در `src/app/layout.tsx` تعریف شده؛ آن را حذف نکنید |
