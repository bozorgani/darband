"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import {
  BellIcon,
  BoxIcon,
  GridIcon,
  HeartIcon,
  LogoutIcon,
  PinIcon,
  UserIcon,
} from "@/components/ui/Icons";
import { Breadcrumb } from "@/components/ui/Disclosure";
import { useAuth } from "@/features/auth/AuthProvider";
import { fullName, initials, maskPhone } from "@/features/auth/auth.utils";
import { useToast } from "@/store/toast";
import { useAccount } from "./AccountProvider";

interface NavEntry {
  href: string;
  label: string;
  icon: typeof GridIcon;
  exact?: boolean;
}

export const accountNav: NavEntry[] = [
  { href: "/account", label: "پیشخوان", icon: GridIcon, exact: true },
  { href: "/account/orders", label: "سفارش‌های من", icon: BoxIcon },
  { href: "/account/addresses", label: "نشانی‌ها", icon: PinIcon },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: HeartIcon },
  { href: "/account/profile", label: "اطلاعات حساب", icon: UserIcon },
  { href: "/account/notifications", label: "اعلان‌ها", icon: BellIcon },
];

function useIsActive() {
  const pathname = usePathname();
  return (entry: NavEntry) =>
    entry.exact ? pathname === entry.href : pathname.startsWith(entry.href);
}

/** Shared chrome for every account page: profile summary, navigation, logout. */
export function AccountShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { unread } = useAccount();
  const { toast } = useToast();
  const isActive = useIsActive();

  if (!user) return null;

  /* Inside the protected area the guard performs the redirect (to `/auth`)
     as soon as the session disappears — issuing a second navigation here would
     race with it. Cart and wishlist are intentionally left untouched. */
  const handleLogout = () => {
    signOut();
    toast({ tone: "info", title: "از حساب خود خارج شدید", description: "سبد خرید شما محفوظ ماند." });
  };

  return (
    <div className="bg-cream-50/40">
      <div className="container-page py-8 lg:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-[17rem_1fr] xl:gap-10">
          {/* ---------------------------- Sidebar ---------------------------- */}
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <div className="relative overflow-hidden rounded-3xl bg-espresso-900 p-6 text-cream-50 grain">
              <div className="relative flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-600 text-base font-black text-white">
                  {initials(user)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {fullName(user) || "کاربر قهوینو"}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] text-cream-100/70">
                    {maskPhone(user.phone)}
                  </p>
                </div>
              </div>
              <dl className="relative mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-center">
                <div>
                  <dt className="text-[0.65rem] text-cream-100/60">اعتبار</dt>
                  <dd className="mt-1 text-sm font-bold">
                    {toPersianDigits(user.credit.toLocaleString("en-US"))}
                    <span className="ms-1 text-[0.6rem] font-medium opacity-70">تومان</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] text-cream-100/60">امتیاز</dt>
                  <dd className="mt-1 text-sm font-bold">
                    {toPersianDigits(user.loyaltyPoints.toLocaleString("en-US"))}
                  </dd>
                </div>
              </dl>
            </div>

            <nav aria-label="ناوبری حساب کاربری" className="mt-4">
              <ul className="space-y-1">
                {accountNav.map((entry) => {
                  const Icon = entry.icon;
                  const active = isActive(entry);
                  return (
                    <li key={entry.href}>
                      <Link
                        href={entry.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200",
                          active
                            ? "bg-espresso-900 text-cream-50"
                            : "text-espresso-800 hover:bg-espresso-900/6",
                        )}
                      >
                        <Icon className="size-[18px]" />
                        <span className="flex-1">{entry.label}</span>
                        {entry.href === "/account/notifications" && unread > 0 && (
                          <span
                            className={cn(
                              "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                              active ? "bg-cream-50 text-espresso-900" : "bg-accent-600 text-white",
                            )}
                          >
                            {toPersianDigits(unread)}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    data-testid="logout-desktop"
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-danger transition-colors duration-200 hover:bg-danger/10"
                  >
                    <LogoutIcon className="size-[18px]" />
                    خروج از حساب
                  </button>
                </li>
              </ul>
            </nav>

            <Link
              href="/shop"
              className="mt-4 flex items-center justify-between rounded-2xl border border-dashed border-beige-300 px-4 py-3 text-xs font-semibold text-espresso-800 transition hover:border-espresso-900/40"
            >
              ادامه خرید در فروشگاه
              <span aria-hidden="true">←</span>
            </Link>
          </aside>

          {/* ----------------------------- Content ---------------------------- */}
          <div className="min-w-0">
            <MobileAccountNav onLogout={handleLogout} unread={unread} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile pattern: a scrollable chip rail instead of a cramped sidebar. */
function MobileAccountNav({ onLogout, unread }: { onLogout: () => void; unread: number }) {
  const isActive = useIsActive();
  const { user } = useAuth();

  return (
    <div className="mb-6 lg:hidden">
      <div className="flex items-center gap-3 rounded-3xl bg-espresso-900 p-4 text-cream-50">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-600 text-sm font-black text-white">
          {user ? initials(user) : ""}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">
            {user && (fullName(user) || "کاربر قهوینو")}
          </p>
          <p className="mt-0.5 text-[0.7rem] text-cream-100/70">
            {user ? maskPhone(user.phone) : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          data-testid="logout-mobile"
          aria-label="خروج از حساب"
          className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <LogoutIcon className="size-5" />
        </button>
      </div>

      <nav aria-label="ناوبری حساب کاربری" className="mt-3">
        <ul className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {accountNav.map((entry) => {
            const Icon = entry.icon;
            const active = isActive(entry);
            return (
              <li key={entry.href} className="shrink-0">
                <Link
                  href={entry.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors",
                    active
                      ? "border-espresso-900 bg-espresso-900 text-cream-50"
                      : "border-espresso-900/15 bg-white/70 text-espresso-800",
                  )}
                >
                  <Icon className="size-4" />
                  {entry.label}
                  {entry.href === "/account/notifications" && unread > 0 && (
                    <span className="flex min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[0.6rem] font-bold text-white">
                      {toPersianDigits(unread)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Page-level header used by every account screen. */
export function AccountPageHeader({
  title,
  description,
  breadcrumb,
  action,
}: {
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  action?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <Breadcrumb
        items={[
          { label: "خانه", href: "/" },
          { label: "حساب کاربری", href: "/account" },
          ...(breadcrumb ?? []),
        ]}
      />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-espresso-900 sm:text-[1.75rem]">{title}</h1>
          {description && <p className="mt-2 max-w-xl text-sm/7 text-ash-600">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
