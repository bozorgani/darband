# دربند — DARBAND Roasters

فروشگاه آنلاین قهوهٔ تخصصی، تمام‌فارسی و RTL. **Frontend-only**: تمام داده‌ها ماک و ایزوله در `src/data/` هستند.

## اجرا

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npx next start
```

## بررسی کیفیت

```bash
npx tsc --noEmit     # type-check
npx eslint src       # lint (Next 16 دیگر next lint ندارد)
node qa/flows.cjs    # ۲۹ سناریوی تعاملی (سرور باید بالا باشد)
node qa/overflow.cjs # سرریز افقی + خطای کنسول در ۶ بریک‌پوینت
node qa/shots.cjs    # اسکرین‌شات تمام‌صفحه از ۸ صفحه × ۲ ویوپورت
```

استک: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Vazirmatn (self-hosted).

گزارش کامل پروژه: [`REPORT.md`](./REPORT.md)
