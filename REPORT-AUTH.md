# گزارش مرحله دوم — احراز هویت موبایلی و پنل کاربری

**پروژه:** فروشگاه قهوه تخصصی «دربند» · **مخزن:** `github.com/bozorgani/darband`
**دامنه این مرحله:** ورود/ثبت‌نام با شماره موبایل ایران + OTP نمایشی + پنل کاربری کامل
**همچنان Frontend-only:** هیچ Backend، API Route، Server Action، دیتابیس، سرویس پیامک، JWT یا درگاه پرداختی ساخته نشده است.

---

## ۱. وضعیت اولیه مخزن (Baseline)

- کلون `github.com/bozorgani/darband` روی `fd407d3 first commit1`؛ درخت کاری با مخزن یکسان بود (تنها `RUN.md` نسخهٔ محلی و tracked نبود).
- `AGENTS.md` خوانده و رعایت شد (قواعد Next.js 16؛ بلوک `nextjs-agent-rules` دست‌نخورده ماند).
- نتایج اجرای دستورات قبل از تغییر:

| دستور | نتیجهٔ Baseline |
|---|---|
| `npm ci` | ✅ موفق |
| `npx tsc --noEmit` | ✅ بدون خطا |
| `npm run lint` | ❌ **۴ خطای از پیش موجود** — `@typescript-eslint/no-require-imports` در `qa/*.cjs` (اسکریپت‌های QA با CommonJS نوشته شده‌اند و اسکریپت `lint` کل مخزن را لینت می‌کند) |
| `npm run build` | ✅ موفق — ۴۳ مسیر |

**رفع Baseline:** در `eslint.config.mjs` یک override محدود برای `qa/**/*.cjs` اضافه شد تا `require` در آن فایل‌ها مجاز باشد. این تنها تغییرِ مربوط به مشکل قبلی است و با کار جدید مخلوط نشده.

---

## ۲. صفحات ساخته‌شده

| مسیر | محتوا |
|---|---|
| `/auth` | ورود/ثبت‌نام یکپارچه؛ لوگو، عنوان، توضیح حریم خصوصی، ورودی موبایل محلی (`09…`، بدون پیشوند تزئینی)، CTA ارسال کد، لینک بازگشت به فروشگاه، قوانین/حریم خصوصی، ستون ادیتوریال تصویری در دسکتاپ |
| `/auth/verify` | نمایش شماره Mask‌شده، اصلاح شماره، ۵ خانهٔ OTP (Paste، حرکت خودکار فوکوس، Backspace، Arrow، Enter، `one-time-code`)، شمارش معکوس ارسال مجدد، اعتبار کد، حالت‌های در حال بررسی/کد اشتباه/منقضی/موفق و مرحلهٔ تکمیل پروفایل برای کاربر جدید |
| `/account` | پیشخوان: خوش‌آمد با نام، شماره تأییدشده، نوار تکمیل پروفایل، ۴ کارت خلاصه، آخرین سفارش با تصاویر و CTA، ۶ دسترسی سریع، ۴ محصول پیشنهادی |
| `/account/orders` | فهرست سفارش‌ها، فیلتر وضعیت (۵ وضعیت)، جستجوی شماره/نام کالا، Skeleton، Empty State، کارت‌های ریسپانسیو |
| `/account/orders/[id]` | تایم‌لاین مراحل، کالاها با نوع/وزن/آسیاب، خلاصهٔ پرداخت (تخفیف/ارسال/نهایی)، نشانی تحویل، پرداخت نمایشی، «خرید دوباره» (به سبد واقعی اضافه می‌کند)، فاکتور نمایشی، پشتیبانی؛ شناسهٔ ناموجود → صفحهٔ ۴۰۴ سایت |
| `/account/profile` | ویرایش نام/نام خانوادگی/ایمیل/تاریخ تولد/جنسیت، شماره تأییدشده و قفل‌شده، فلوی Mock تغییر شماره (شماره جدید → OTP → تأیید)، حالت Saving، Toast، دیالوگ اطلاع‌رسانی حذف حساب |
| `/account/addresses` | فهرست نشانی‌ها، نشانی پیش‌فرض، افزودن/ویرایش در Drawer، حذف با Confirmation، Empty State، اعتبارسنجی ایرانی (موبایل، کدپستی ۱۰ رقمی)، استان/شهر از Mock ساختارمند |
| `/account/wishlist` | همان Store مشترک `/wishlist` داخل پوستهٔ پنل (حذف، افزودن به سبد، افزودن گروهی، Empty State) |
| `/account/notifications` | ۶ اعلان در ۴ دسته، خوانده/خوانده‌نشده، «همه خوانده شد»، Empty State، سه سوییچ تنظیمات (پیامک سفارش، پیشنهادها، خبرنامه) |

---

## ۳. فایل‌های اضافه/تغییریافته

**جدید**

```
src/features/auth/      auth.types.ts · auth.utils.ts · auth.service.ts · AuthProvider.tsx
                        AuthShell.tsx · AuthEntry.tsx · VerifyEntry.tsx
                        PhoneForm.tsx · OtpForm.tsx · CompleteProfileForm.tsx
src/features/account/   account.types.ts · account.service.ts · AccountProvider.tsx
                        AccountGuard.tsx · AccountShell.tsx · DashboardView.tsx
                        OrdersView.tsx · OrderDetailView.tsx · ProfileView.tsx
                        AddressesView.tsx · NotificationsView.tsx
src/data/mock-user.ts   کاربر، ۵ سفارش، ۲ نشانی، ۶ اعلان، استان/شهر، برچسب وضعیت‌ها
src/app/auth/           page.tsx · verify/page.tsx
src/app/account/        layout.tsx · page.tsx · orders/(page|[id]/page) · profile · addresses · wishlist · notifications
src/components/layout/AccountMenu.tsx
qa/auth.cjs · qa/shots-auth.cjs
```

**تغییریافته**

```
src/components/layout/AppShell.tsx      + AuthProvider (ToastProvider → AuthProvider → StoreProvider)
src/components/layout/Header.tsx        + <AccountMenu /> کنار جستجو/علاقه‌مندی/سبد
src/components/layout/MobileNav.tsx     + بخش حساب کاربری (پیشخوان، سفارش‌ها، اعلان‌ها، خروج) یا CTA ورود
src/components/ui/Icons.tsx             + User, Logout, Bell, Box, Grid, Edit, Download, Lock
src/components/wishlist/WishlistView.tsx + پراپ `embedded` برای رندر داخل پنل (بدون Wishlist دوم)
src/app/robots.ts                        + Disallow برای /auth و /account
eslint.config.mjs                        override برای qa/*.cjs (رفع مشکل Baseline)
README.md · RUN.md · .gitignore
```

هیچ dependency جدیدی نصب نشد.

---

## ۴. معماری Mock Authentication

```
UI            PhoneForm / OtpForm / CompleteProfileForm / AccountShell …
              ↕ (فقط از طریق Context)
State         AuthProvider  →  status: idle | validating | sending | codeSent
                                        | verifying | authenticated | error | expired
              AccountProvider → addresses / notifications / prefs (localStorage) + orders (mock)
              ↕
Service       auth.service.ts   requestOtp · verifyOtp · getCurrentUser · updateProfile
                                · requestPhoneChange · confirmPhoneChange · logout
                                · requestAccountDeletion
              account.service.ts filterOrders · sortAddresses · orderToCartItems …
              ↕
Data          src/data/mock-user.ts
```

- شماره‌ها پیش از ذخیره به فرمت Canonical **`+989121234567`** نرمال می‌شوند (`auth.utils.ts`)؛ ورودی محلی `09…` باقی می‌ماند و Paste فرمت بین‌المللی بلافاصله به شکل محلی بازنویسی می‌شود.
- مقصد Redirect بعد از ورود از `getSafeRedirectPath()` (در `src/features/auth/redirect.ts`) عبور می‌کند: فقط `/account` و `/account/*`؛ در غیر این صورت `/account`.
- مرحله تکمیل پروفایل از روی نشست محاسبه می‌شود (`isProfileComplete`)، بنابراین Refresh آن را از دست نمی‌دهد.
- Challenge در `sessionStorage` (`darband.auth.challenge.v1`) با TTL ۱۲۰ ثانیه، ارسال مجدد پس از ۴۵ ثانیه و حداکثر ۳ تلاش نگهداری می‌شود.
- نشست در `localStorage` (`darband.auth.session.v1`) است و در کد با کامنت صریح **«این احراز هویت امن نیست»** علامت‌گذاری شده.
- تأخیرهای کنترل‌شدهٔ ۵۰۰–۶۵۰ میلی‌ثانیه فقط برای واقعی‌شدن حالت‌های Loading.
- Guard مسیرها (`AccountGuard`) صرفاً UX است: تا پایان Hydration اسکلتون نشان می‌دهد و کاربر واردنشده را با حفظ مقصد به `/auth?next=…` می‌فرستد.

---

## ۵. شماره‌ها و کد تست

| مورد | مقدار |
|---|---|
| کد OTP نمایشی | **`12345`** (فقط در `auth.service.ts`؛ در UI نمایش داده نمی‌شود) |
| کاربر موجود | `09121234567` → مستقیم وارد پنل |
| کاربر جدید | `09120000000` → مرحله تکمیل پروفایل |
| فرمت‌های پذیرفته‌شده | `09121234567` · `9121234567` · `+989121234567` · `00989121234567` + ارقام فارسی/عربی، فاصله، خط تیره و پرانتز |
| Canonical داخلی | `+989121234567` (نمایش UI: `۰۹۱۲ ۱۲۳ ۴۵۶۷` و Mask: `۰۹۱۲ ••• ۴۵۶۷`) |

---

## ۶. قابلیت‌های Mock

ورود/ثبت‌نام و OTP · تشخیص کاربر جدید/قدیمی · نشست و خروج · تغییر شماره موبایل · درخواست حذف حساب · سفارش‌ها و تایم‌لاین · فاکتور · نشانی‌ها (CRUD) · اعلان‌ها و تنظیمات اطلاع‌رسانی · اعتبار و امتیاز وفاداری · محصولات پیشنهادی.

## ۷. نیازمند Backend واقعی (همه با `// TODO(backend):` در کد)

`POST /auth/otp/request` · `POST /auth/otp/verify` (کوکی httpOnly) · `GET/PATCH /auth/me` · `POST /auth/logout` · تغییر شماره و حذف حساب سمت سرور · `GET /account/orders(/:id)` · CRUD نشانی‌ها · اعلان‌ها و تنظیمات · Rate limiting، تولید و انقضای کد، شمارش تلاش‌ها و **محافظت واقعی از مسیرها در middleware**. سبد، تسویه‌حساب و پرداخت مثل قبل Mock باقی مانده‌اند.

---

## ۸–۱۲. نتایج بررسی نهایی

| بررسی | دستور | نتیجه |
|---|---|---|
| Type-check | `npx tsc --noEmit` | ✅ بدون خطا |
| Lint (اسکریپت رسمی پروژه) | `npm run lint` | ✅ **۰ خطا، ۰ هشدار** (شامل رفع ۴ خطای Baseline) |
| Build | `npm run build` | ✅ موفق — **۵۶ مسیر** پیش‌رندر (۴۳ قبلی + ۱۳ مسیر جدید) |
| QA احراز هویت و پنل | `node qa/auth.cjs` | ✅ **۴۲/۴۲ PASS، ۰ شکست** |
| QA فروشگاه (رگرسیون) | `node qa/flows.cjs` | ✅ **۲۹/۲۹ PASS** — بدون رگرسیون |
| سرریز/کنسول کل سایت | `node qa/overflow.cjs` | ✅ CLEAN — ۶ بریک‌پوینت × ۱۲ صفحه |
| سرریز صفحات جدید | داخل `qa/auth.cjs` | ✅ ۹ مسیر × ۳۷۵/۳۹۰/۷۶۸/۱۰۲۴/۱۲۸۰/۱۴۴۰ بدون سرریز |
| خطای کنسول/Hydration | داخل هر دو سوییت | ✅ صفر خطا در دسکتاپ و موبایل |
| SEO | `curl` | ✅ `noindex, nofollow, nocache` روی `/auth`، `/auth/verify` و همه `/account/*`؛ صفر ورودی در `sitemap.xml`؛ `Disallow` در `robots.txt`؛ بدون canonical/OG اشتباه |

**پوشش QA جدید (۴۲ بررسی):** ریدایرکت مهمان با حفظ مقصد · رد ۷ نوع ورودی نامعتبر (کوتاه، بلند، ثابت، حروف، غیرایرانی، فقط علامت، خالی) با پیام دقیق · نرمال‌سازی ۹ فرمت مختلف به یک Canonical · شماره Mask‌شده · کد اشتباه · کد منقضی · شمارش معکوس · ارسال مجدد · ورود کاربر موجود و بازگشت به مسیر مقصد · حفظ نشست پس از Refresh · منوی حساب در هدر · فهرست/فیلتر/جستجوی سفارش‌ها · جزئیات سفارش · خرید دوباره → سبد · شناسهٔ نامعتبر · ذخیره و اعتبارسنجی پروفایل · افزودن/ویرایش/حذف نشانی با تأیید · اعتبارسنجی فرم نشانی · اعلان‌ها و سوییچ‌ها · Wishlist مشترک و افزودن گروهی · خروج و مسدودشدن دوباره مسیر · حفظ سبد پس از خروج · ثبت‌نام کاربر جدید و اعتبارسنجی مرحله پروفایل · فلوی کاملاً کیبوردی · Paste کد · ناوبری و خروج در موبایل · Drawer نشانی در موبایل.

---

## ۱۳. مشکلات باقی‌مانده

1. **۱۰ تصویر جای‌گیر** از مرحله قبل هنوز کپی `hero.jpg` هستند (`products/{v60-1,frenchpress-1,gift-1,filter-1}`، `story`, `roastery`, `lifestyle/1..4`)؛ در تصاویر سفارش‌ها هم دیده می‌شوند. سهمیهٔ تولید تصویر در نوبت قبل تمام شد.
2. Guard و نشست **فقط نمایشی** هستند؛ تا زمانی که middleware و کوکی امضاشده اضافه نشود نباید امن تلقی شوند (در کد و همین گزارش تصریح شده).
3. خروج از داخل پنل عمداً به `/auth` می‌رسد (Guard مالک ریدایرکت است تا مسابقهٔ ناوبری رخ ندهد)؛ خروج از هدر/منوی موبایل کاربر را به صفحهٔ اصلی می‌برد. سبد و علاقه‌مندی در هر دو حالت حفظ می‌شوند.
4. تاریخ‌ها به‌صورت رشتهٔ جلالی در Mock ذخیره شده‌اند؛ برای Backend واقعی باید ISO + تبدیل جلالی در لایهٔ نمایش استفاده شود.
5. پوشهٔ `qa/` و وابستگی `playwright` عمداً باقی مانده‌اند (اسکریپت‌های تست)؛ تصاویر خروجی QA در `.gitignore` قرار گرفتند.

---

## ۱۴. `git status --short` (پس از Commit)

```
(پاک — همهٔ تغییرات در کامیت feat: add mobile OTP authentication and customer account ثبت شد)
```
