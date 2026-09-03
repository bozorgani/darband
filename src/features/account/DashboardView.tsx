"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Badge, Price } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import {
  BagIcon,
  BellIcon,
  BoxIcon,
  HeartIcon,
  PinIcon,
  SparkIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { ProductCard } from "@/components/products/ProductCard";
import { products } from "@/data/products";
import { orderStatusLabels } from "@/data/mock-user";
import { formatNumber, toPersianDigits } from "@/lib/format";
import { useAuth } from "@/features/auth/AuthProvider";
import { fullName, maskPhone, profileCompletion } from "@/features/auth/auth.utils";
import { useStore } from "@/store/store";
import { useAccount } from "./AccountProvider";
import { AccountPageHeader } from "./AccountShell";
import { orderStatusTone } from "./account.service";

export function DashboardView() {
  const { user } = useAuth();
  const { orders, unread, addresses } = useAccount();
  const { wishlist } = useStore();

  const completion = user ? profileCompletion(user) : 0;
  const processing = orders.filter((o) =>
    ["processing", "awaiting-payment", "shipped"].includes(o.status),
  ).length;
  const lastOrder = orders[0];

  /* Simple mock recommendation: best sellers the customer has not ordered yet. */
  const recommended = useMemo(() => {
    const ordered = new Set(orders.flatMap((o) => o.items.map((i) => i.productId)));
    return products
      .filter((p) => p.inStock && !ordered.has(p.id))
      .sort((a, b) => Number(b.bestSeller ?? false) - Number(a.bestSeller ?? false))
      .slice(0, 4);
  }, [orders]);

  if (!user) return null;

  return (
    <>
      <AccountPageHeader
        title={`${fullName(user) || "دوست قهوینویی"} عزیز، خوش آمدید`}
        description="از این‌جا سفارش‌ها، نشانی‌ها و علاقه‌مندی‌های خود را مدیریت کنید."
      />

      {/* Verified phone + profile completeness */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-beige-300/70 bg-white/70 p-4">
        <Badge tone="success">
          <SparkIcon className="size-3.5" />
          شماره تأییدشده
        </Badge>
        {/* Persian digits (maskPhone) must not use the Latin serif, which has
            no Persian glyphs. */}
        <span className="text-sm font-semibold text-espresso-900">
          {maskPhone(user.phone)}
        </span>

        <div className="ms-auto flex min-w-[13rem] flex-1 items-center gap-3 sm:flex-none">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[0.7rem] text-ash-600">
              <span>تکمیل پروفایل</span>
              <span className="font-bold text-espresso-900">{toPersianDigits(completion)}٪</span>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-beige-200"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="درصد تکمیل پروفایل"
            >
              <div
                className="h-full rounded-full bg-accent-600 transition-[width] duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
          {completion < 100 && (
            <ButtonLink href="/account/profile" size="sm" variant="outline">
              تکمیل
            </ButtonLink>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={<BoxIcon className="size-5" />}
          label="سفارش‌های ثبت‌شده"
          value={toPersianDigits(orders.length)}
          href="/account/orders"
        />
        <SummaryCard
          icon={<BagIcon className="size-5" />}
          label="در حال پردازش"
          value={toPersianDigits(processing)}
          href="/account/orders"
        />
        <SummaryCard
          icon={<HeartIcon className="size-5" />}
          label="علاقه‌مندی‌ها"
          value={toPersianDigits(wishlist.length)}
          href="/account/wishlist"
        />
        <SummaryCard
          icon={<SparkIcon className="size-5" />}
          label="اعتبار قهوه (تومان)"
          value={formatNumber(user.credit)}
          hint={`${toPersianDigits(user.loyaltyPoints)} امتیاز`}
        />
      </div>

      {/* Recent order */}
      <section aria-labelledby="recent-order" className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="recent-order" className="text-lg font-bold text-espresso-900">
            آخرین سفارش
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-accent-600 underline underline-offset-4"
          >
            همه سفارش‌ها
          </Link>
        </div>

        {lastOrder ? (
          <article className="rounded-3xl border border-beige-300/70 bg-white/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="latin text-sm font-bold text-espresso-900">{lastOrder.number}</p>
                <p className="mt-1 text-xs text-ash-600">ثبت‌شده در {lastOrder.date}</p>
              </div>
              <Badge tone={orderStatusTone[lastOrder.status]}>
                {orderStatusLabels[lastOrder.status]}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3 -space-x-reverse">
                {lastOrder.items.slice(0, 3).map((item) => (
                  <span
                    key={item.productId}
                    className="relative size-14 overflow-hidden rounded-2xl border-2 border-white bg-cream-100"
                  >
                    <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-xs text-ash-600">
                {toPersianDigits(lastOrder.items.length)} کالا ·{" "}
                {lastOrder.items.map((i) => i.title).join("، ")}
              </p>
              <div className="ms-auto flex items-center gap-3">
                <Price value={lastOrder.total} />
                <ButtonLink href={`/account/orders/${lastOrder.id}`} size="sm">
                  مشاهده جزئیات
                </ButtonLink>
              </div>
            </div>
          </article>
        ) : (
          <EmptyState
            icon={<BoxIcon className="size-7" />}
            title="هنوز سفارشی ثبت نکرده‌اید"
            description="اولین قهوه تازه‌رست خود را انتخاب کنید؛ ارسال سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان رایگان است."
            actionLabel="شروع خرید"
            actionHref="/shop"
          />
        )}
      </section>

      {/* Quick actions */}
      <section aria-labelledby="quick-actions" className="mt-8">
        <h2 id="quick-actions" className="mb-4 text-lg font-bold text-espresso-900">
          دسترسی سریع
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            href="/account/orders"
            icon={<BoxIcon className="size-5" />}
            title="پیگیری سفارش‌ها"
            description="وضعیت و کد رهگیری هر سفارش"
          />
          <QuickAction
            href="/account/profile"
            icon={<UserIcon className="size-5" />}
            title="تکمیل پروفایل"
            description="نام، ایمیل و تاریخ تولد"
          />
          <QuickAction
            href="/account/addresses"
            icon={<PinIcon className="size-5" />}
            title={addresses.length ? "مدیریت نشانی‌ها" : "افزودن نشانی"}
            description={`${toPersianDigits(addresses.length)} نشانی ثبت‌شده`}
          />
          <QuickAction
            href="/account/wishlist"
            icon={<HeartIcon className="size-5" />}
            title="علاقه‌مندی‌ها"
            description={`${toPersianDigits(wishlist.length)} محصول ذخیره‌شده`}
          />
          <QuickAction
            href="/account/notifications"
            icon={<BellIcon className="size-5" />}
            title="اعلان‌ها"
            description={unread ? `${toPersianDigits(unread)} پیام خوانده‌نشده` : "همه پیام‌ها خوانده شد"}
          />
          <QuickAction
            href="/shop"
            icon={<BagIcon className="size-5" />}
            title="ادامه خرید"
            description="لات‌های تازه این هفته"
          />
        </div>
      </section>

      {/* Recommendations */}
      {recommended.length > 0 && (
        <section aria-labelledby="recommended" className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">بر اساس خریدهای شما</p>
              <h2 id="recommended" className="text-lg font-bold text-espresso-900">
                شاید این قهوه‌ها را دوست داشته باشید
              </h2>
            </div>
            <ButtonLink href="/shop" variant="ghost" size="sm">
              همه محصولات
            </ButtonLink>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 xl:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-full bg-espresso-900/6 text-espresso-800">
        {icon}
      </span>
      <div className="mt-4">
        <p className="text-xl font-black text-espresso-900">{value}</p>
        <p className="mt-1 text-xs text-ash-600">{label}</p>
        {hint && <p className="mt-0.5 text-[0.7rem] text-ash-400">{hint}</p>}
      </div>
    </>
  );

  const className =
    "flex flex-col rounded-3xl border border-beige-300/70 bg-white/70 p-5 transition-colors duration-200";

  return href ? (
    <Link href={href} className={`${className} hover:border-espresso-900/30`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-beige-300/70 bg-white/70 p-4 transition-colors duration-200 hover:border-espresso-900/30"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cream-100 text-espresso-800 transition-colors group-hover:bg-espresso-900 group-hover:text-cream-50">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-espresso-900">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-ash-600">{description}</span>
      </span>
    </Link>
  );
}
