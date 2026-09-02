"use client";

import Link from "next/link";
import { BellIcon, BoxIcon, CheckIcon, LeafIcon, SparkIcon, UserIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { useToast } from "@/store/toast";
import type { NotificationKind, NotificationPrefs } from "./account.types";
import { useAccount } from "./AccountProvider";
import { AccountPageHeader } from "./AccountShell";

const kindMeta: Record<NotificationKind, { label: string; icon: typeof BellIcon }> = {
  order: { label: "سفارش", icon: BoxIcon },
  offer: { label: "پیشنهاد", icon: SparkIcon },
  stock: { label: "موجودی", icon: LeafIcon },
  account: { label: "حساب کاربری", icon: UserIcon },
};

const prefLabels: { key: keyof NotificationPrefs; title: string; description: string }[] = [
  {
    key: "orderSms",
    title: "پیامک وضعیت سفارش",
    description: "برای هر تغییر وضعیت سفارش پیامک دریافت کنید.",
  },
  {
    key: "offers",
    title: "پیشنهادهای ویژه",
    description: "تخفیف‌ها و لات‌های محدود پیش از عرضه عمومی.",
  },
  {
    key: "newsletter",
    title: "خبرنامه قهوینو",
    description: "ماهی یک ایمیل درباره قهوه، رست و دم‌آوری.",
  },
];

export function NotificationsView() {
  const { notifications, unread, markRead, markAllRead, prefs, setPref, hydrated } = useAccount();
  const { toast } = useToast();

  return (
    <>
      <AccountPageHeader
        title="اعلان‌ها"
        description="وضعیت سفارش‌ها، پیشنهادهای ویژه و پیام‌های حساب کاربری."
        breadcrumb={[{ label: "اعلان‌ها" }]}
        action={
          notifications.length > 0 && unread > 0 ? (
            <Button
              variant="outline"
              size="sm"
              data-testid="mark-all-read"
              onClick={() => {
                markAllRead();
                toast({ tone: "success", title: "همه اعلان‌ها خوانده‌شده شد" });
              }}
            >
              <CheckIcon className="size-4" />
              علامت‌گذاری همه به‌عنوان خوانده‌شده
            </Button>
          ) : undefined
        }
      />

      {!hydrated ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-24 rounded-3xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellIcon className="size-7" />}
          title="اعلان تازه‌ای ندارید"
          description="به‌محض تغییر وضعیت سفارش یا انتشار لات‌های جدید، این‌جا خبردار می‌شوید."
          actionLabel="مشاهده فروشگاه"
          actionHref="/shop"
        />
      ) : (
        <ul className="space-y-3" data-testid="notification-list">
          {notifications.map((item) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-4 rounded-3xl border p-4 transition-colors sm:p-5",
                  item.read
                    ? "border-beige-300/70 bg-white/50"
                    : "border-espresso-900/20 bg-white",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-2xl",
                    item.read ? "bg-cream-100 text-ash-600" : "bg-espresso-900 text-cream-50",
                  )}
                >
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-espresso-900">{item.title}</h2>
                    {!item.read && (
                      <span className="rounded-full bg-accent-600 px-2 py-0.5 text-[0.6rem] font-bold text-white">
                        جدید
                      </span>
                    )}
                    <span className="ms-auto text-[0.7rem] text-ash-400">{item.date}</span>
                  </div>
                  <p className="mt-1.5 text-xs/6 text-ash-600">{item.body}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[0.65rem] font-semibold text-espresso-800">
                      {meta.label}
                    </span>
                    {item.href && (
                      <Link
                        href={item.href}
                        onClick={() => markRead(item.id)}
                        className="text-xs font-semibold text-accent-600 underline underline-offset-4"
                      >
                        مشاهده
                      </Link>
                    )}
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markRead(item.id)}
                        className="text-xs font-semibold text-espresso-800 underline underline-offset-4 hover:text-espresso-950"
                      >
                        خوانده شد
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Preferences */}
      <section
        aria-labelledby="notification-prefs"
        className="mt-8 rounded-3xl border border-beige-300/70 bg-white/70 p-5 sm:p-6"
      >
        <h2 id="notification-prefs" className="text-sm font-bold text-espresso-900">
          تنظیمات اطلاع‌رسانی
        </h2>
        <p className="mt-1.5 text-xs text-ash-600">
          این تنظیمات نمایشی است و روی سرویس واقعی پیامک یا ایمیل اثری ندارد.
        </p>

        <ul className="mt-5 divide-y divide-beige-300/60">
          {prefLabels.map((pref) => (
            <li key={pref.key} className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <div>
                <p className="text-sm font-semibold text-espresso-900">{pref.title}</p>
                <p className="mt-1 text-xs text-ash-600">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[pref.key]}
                aria-label={pref.title}
                data-testid={`pref-${pref.key}`}
                onClick={() => setPref(pref.key, !prefs[pref.key])}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
                  prefs[pref.key] ? "bg-espresso-900" : "bg-beige-300",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-300",
                    prefs[pref.key] ? "start-6" : "start-1",
                  )}
                />
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[0.7rem] text-ash-400">
          {toPersianDigits(unread)} اعلان خوانده‌نشده دارید.
        </p>
      </section>
    </>
  );
}
