"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Input, Price, Skeleton } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { BoxIcon, SearchIcon } from "@/components/ui/Icons";
import { orderStatusLabels } from "@/data/mock-user";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDebounced, useSimulatedLoading } from "@/hooks";
import type { OrderStatus } from "./account.types";
import { filterOrders, orderStatusTone } from "./account.service";
import { useAccount } from "./AccountProvider";
import { AccountPageHeader } from "./AccountShell";

const STATUS_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "awaiting-payment", label: orderStatusLabels["awaiting-payment"] },
  { key: "processing", label: orderStatusLabels.processing },
  { key: "shipped", label: orderStatusLabels.shipped },
  { key: "delivered", label: orderStatusLabels.delivered },
  { key: "cancelled", label: orderStatusLabels.cancelled },
];

export function OrdersView() {
  const { orders } = useAccount();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 220);
  const loading = useSimulatedLoading([status, debounced]);

  const visible = useMemo(
    () => filterOrders(orders, { status, query: debounced }),
    [orders, status, debounced],
  );

  return (
    <>
      <AccountPageHeader
        title="سفارش‌های من"
        description="وضعیت، کد رهگیری و جزئیات همه سفارش‌های شما در یک نگاه."
        breadcrumb={[{ label: "سفارش‌های من" }]}
      />

      <div className="flex flex-col gap-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ash-400" />
          <Input
            name="order-search"
            value={query}
            data-testid="order-search"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو با شماره سفارش یا نام محصول…"
            aria-label="جستجو در سفارش‌ها"
            className="ps-11"
          />
        </div>

        <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatus(tab.key)}
              aria-pressed={status === tab.key}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors",
                status === tab.key
                  ? "border-espresso-900 bg-espresso-900 text-cream-50"
                  : "border-espresso-900/15 bg-white/70 text-espresso-800 hover:border-espresso-900/35",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs text-ash-600" role="status" aria-live="polite">
        {loading
          ? "در حال به‌روزرسانی…"
          : `${toPersianDigits(visible.length)} سفارش یافت شد`}
      </p>

      <div className="mt-3 space-y-4" data-testid="orders-list">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-3xl" />
          ))
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<BoxIcon className="size-7" />}
            title="سفارشی با این مشخصات پیدا نشد"
            description="فیلتر وضعیت یا عبارت جستجو را تغییر دهید، یا از فروشگاه دربند خرید تازه‌ای را شروع کنید."
            actionLabel="رفتن به فروشگاه"
            actionHref="/shop"
          />
        ) : (
          visible.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-beige-300/70 bg-white/70 p-5 transition-colors hover:border-espresso-900/25"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="latin text-sm font-bold text-espresso-900">
                    <Link href={`/account/orders/${order.id}`} className="hover:text-accent-600">
                      {order.number}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-ash-600">
                    {order.date} · {toPersianDigits(order.items.length)} کالا
                  </p>
                </div>
                <Badge tone={orderStatusTone[order.status]}>{orderStatusLabels[order.status]}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3 -space-x-reverse">
                  {order.items.slice(0, 3).map((item) => (
                    <span
                      key={item.productId}
                      className="relative size-12 overflow-hidden rounded-xl border-2 border-white bg-cream-100"
                    >
                      <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                    </span>
                  ))}
                </div>
                <p className="hidden min-w-0 flex-1 truncate text-xs text-ash-600 sm:block">
                  {order.items.map((i) => i.title).join("، ")}
                </p>
                <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                  <Price value={order.total} />
                  <ButtonLink href={`/account/orders/${order.id}`} size="sm" variant="outline">
                    جزئیات
                  </ButtonLink>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
