"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge, Price } from "@/components/ui/Primitives";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import {
  BoxIcon,
  CheckIcon,
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  RefreshIcon,
  TruckIcon,
} from "@/components/ui/Icons";
import { brand } from "@/data/site";
import { orderStatusLabels } from "@/data/mock-user";
import { formatNumber, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { useToast } from "@/store/toast";
import { useAccount } from "./AccountProvider";
import { AccountPageHeader } from "./AccountShell";
import { orderStatusTone, orderToCartItems } from "./account.service";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { getOrder, getAddress } = useAccount();
  const { addItem, setCartOpen } = useStore();
  const { toast } = useToast();

  const order = getOrder(orderId);

  if (!order) {
    return (
      <>
        <AccountPageHeader
          title="سفارش پیدا نشد"
          breadcrumb={[{ label: "سفارش‌های من", href: "/account/orders" }, { label: "سفارش نامشخص" }]}
        />
        <EmptyState
          icon={<BoxIcon className="size-7" />}
          title="چنین سفارشی در حساب شما وجود ندارد"
          description="ممکن است نشانی صفحه اشتباه باشد یا سفارش به حساب دیگری تعلق داشته باشد."
          actionLabel="بازگشت به سفارش‌ها"
          actionHref="/account/orders"
        />
      </>
    );
  }

  const address = getAddress(order.addressId);

  const reorder = () => {
    orderToCartItems(order).forEach((item) => addItem(item));
    toast({
      tone: "success",
      title: "کالاهای این سفارش به سبد اضافه شد",
      description: `${toPersianDigits(order.items.length)} قلم کالا`,
      actionLabel: "مشاهده سبد",
      onAction: () => setCartOpen(true),
    });
  };

  return (
    <>
      <AccountPageHeader
        title={`سفارش ${order.number}`}
        description={`ثبت‌شده در ${order.date}`}
        breadcrumb={[
          { label: "سفارش‌های من", href: "/account/orders" },
          { label: order.number },
        ]}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={reorder} data-testid="reorder">
              <RefreshIcon className="size-4" />
              خرید دوباره
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                toast({
                  tone: "info",
                  title: "فاکتور نمایشی",
                  description: "در نسخه واقعی، فایل PDF فاکتور از سرور دریافت می‌شود.",
                })
              }
            >
              <DownloadIcon className="size-4" />
              دریافت فاکتور
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {/* Status + timeline */}
          <section
            aria-labelledby="order-status"
            className="rounded-3xl border border-beige-300/70 bg-white/70 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="order-status" className="text-sm font-bold text-espresso-900">
                وضعیت سفارش
              </h2>
              <Badge tone={orderStatusTone[order.status]}>{orderStatusLabels[order.status]}</Badge>
            </div>

            {order.trackingCode && (
              <p className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-cream-50 px-4 py-3 text-xs text-ash-600">
                <TruckIcon className="size-4 text-espresso-800" />
                کد رهگیری پستی:
                <span className="latin font-bold text-espresso-900">{order.trackingCode}</span>
              </p>
            )}

            <ol className="mt-5 space-y-0">
              {order.timeline.map((step, i) => (
                <li key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border-2 text-[0.65rem] font-bold",
                        step.done
                          ? "border-espresso-900 bg-espresso-900 text-cream-50"
                          : "border-beige-300 bg-white text-ash-400",
                      )}
                    >
                      {step.done ? <CheckIcon className="size-3.5" /> : toPersianDigits(i + 1)}
                    </span>
                    {i < order.timeline.length - 1 && (
                      <span
                        className={cn(
                          "w-px flex-1",
                          step.done ? "bg-espresso-900/30" : "bg-beige-300",
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className={cn("pb-6", i === order.timeline.length - 1 && "pb-0")}>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        step.done ? "text-espresso-900" : "text-ash-400",
                      )}
                    >
                      {step.label}
                    </p>
                    {step.date && <p className="mt-1 text-[0.7rem] text-ash-600">{step.date}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Items */}
          <section
            aria-labelledby="order-items"
            className="rounded-3xl border border-beige-300/70 bg-white/70 p-5"
          >
            <h2 id="order-items" className="text-sm font-bold text-espresso-900">
              کالاهای سفارش
            </h2>
            <ul className="mt-4 divide-y divide-beige-300/60">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.options.map((o) => o.value).join("-")}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream-100"
                  >
                    <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-espresso-900">
                      <Link href={`/product/${item.slug}`} className="hover:text-accent-600">
                        {item.title}
                      </Link>
                    </h3>
                    {item.options.length > 0 && (
                      <p className="mt-1 text-[0.7rem] text-ash-600">
                        {item.options.map((o) => `${o.label}: ${o.value}`).join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-[0.7rem] text-ash-600">
                      تعداد: {toPersianDigits(item.quantity)}
                    </p>
                  </div>
                  <Price value={item.unitPrice * item.quantity} size="sm" className="shrink-0" />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Summary side */}
        <div className="space-y-5">
          <section
            aria-labelledby="order-summary"
            className="rounded-3xl border border-beige-300/70 bg-white/70 p-5"
          >
            <h2 id="order-summary" className="text-sm font-bold text-espresso-900">
              خلاصه پرداخت
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="جمع کالاها" value={`${formatNumber(order.subtotal)} تومان`} />
              {order.discount > 0 && (
                <Row label="تخفیف" value={`−${formatNumber(order.discount)} تومان`} tone="success" />
              )}
              <Row
                label="هزینه ارسال"
                value={order.shipping === 0 ? "رایگان" : `${formatNumber(order.shipping)} تومان`}
              />
              <div className="border-t border-beige-300/60 pt-3">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-bold text-espresso-900">مبلغ نهایی</dt>
                  <dd>
                    <Price value={order.total} />
                  </dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 rounded-2xl bg-cream-50 px-4 py-3 text-[0.7rem] text-ash-600">
              شیوه پرداخت: {order.paymentMethod}
              {order.paymentRef && (
                <>
                  {" "}
                  · کد پیگیری <span className="latin font-semibold">{order.paymentRef}</span>
                </>
              )}
            </p>
          </section>

          <section
            aria-labelledby="order-address"
            className="rounded-3xl border border-beige-300/70 bg-white/70 p-5"
          >
            <h2 id="order-address" className="text-sm font-bold text-espresso-900">
              نشانی تحویل
            </h2>
            {address ? (
              <address className="mt-3 not-italic text-sm/7 text-ash-600">
                <span className="font-semibold text-espresso-900">{address.recipient}</span>
                <br />
                {address.province}، {address.city}، {address.line}، پلاک {address.plaque}
                {address.unit && `، واحد ${address.unit}`}
                <br />
                کدپستی: <span className="latin">{toPersianDigits(address.postalCode)}</span>
              </address>
            ) : (
              <p className="mt-3 text-sm text-ash-600">
                نشانی این سفارش حذف شده است.{" "}
                <Link href="/account/addresses" className="font-semibold text-accent-600 underline underline-offset-4">
                  مدیریت نشانی‌ها
                </Link>
              </p>
            )}
          </section>

          <section className="rounded-3xl bg-espresso-900 p-5 text-cream-50">
            <h2 className="text-sm font-bold">پشتیبانی سفارش</h2>
            <p className="mt-2 text-xs/6 text-cream-100/70">
              درباره این سفارش سؤالی دارید؟ تیم دربند {brand.hours} پاسخگوی شماست.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${brand.phone.replace(/\s/g, "")}`}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-semibold transition hover:bg-white/20"
              >
                <PhoneIcon className="size-4" />
                تماس تلفنی
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-semibold transition hover:bg-white/20"
              >
                <MailIcon className="size-4" />
                ارسال ایمیل
              </a>
            </div>
          </section>

          <ButtonLink href="/account/orders" variant="ghost" fullWidth>
            بازگشت به فهرست سفارش‌ها
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ash-600">{label}</dt>
      <dd className={cn("font-semibold text-espresso-900", tone === "success" && "text-success")}>
        {value}
      </dd>
    </div>
  );
}
