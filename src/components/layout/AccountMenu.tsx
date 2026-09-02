"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BoxIcon, GridIcon, LogoutIcon, UserIcon } from "@/components/ui/Icons";
import { useAuth } from "@/features/auth/AuthProvider";
import { fullName, initials, maskPhone } from "@/features/auth/auth.utils";
import { useToast } from "@/store/toast";

const MENU_LINKS = [
  { href: "/account", label: "پیشخوان", icon: GridIcon },
  { href: "/account/orders", label: "سفارش‌های من", icon: BoxIcon },
  { href: "/account/profile", label: "اطلاعات حساب", icon: UserIcon },
];

/**
 * Header entry point for the account area.
 * Guests get a plain link to `/auth`; signed-in users get an avatar menu.
 */
export function AccountMenu() {
  const { user, isAuthenticated, hydrated, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Before hydration we cannot know the session — render the guest link, which
     is also the correct destination for signed-out visitors. */
  if (!hydrated || !isAuthenticated || !user) {
    return (
      <Link
        href="/auth"
        aria-label="ورود یا ثبت‌نام"
        title="ورود یا ثبت‌نام"
        data-testid="header-account"
        className="flex size-10 items-center justify-center rounded-full transition hover:bg-current/10"
      >
        <UserIcon className="size-[22px]" />
      </Link>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Mobile: straight to the panel */}
      <Link
        href="/account"
        aria-label={`حساب کاربری ${fullName(user)}`}
        data-testid="header-account"
        className="flex size-10 items-center justify-center rounded-full transition hover:bg-current/10 lg:hidden"
      >
        <Avatar label={initials(user)} />
      </Link>

      {/* Desktop: small account menu */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`حساب کاربری ${fullName(user)}`}
        data-testid="header-account-menu"
        className="hidden size-10 items-center justify-center rounded-full transition hover:bg-current/10 lg:flex"
      >
        <Avatar label={initials(user)} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="منوی حساب کاربری"
          className="absolute end-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-beige-300/70 bg-offwhite p-2 text-espresso-900 shadow-[0_24px_60px_-24px_rgba(34,21,14,0.45)] animate-scale-in"
        >
          <div className="border-b border-beige-300/60 px-3 pb-3 pt-2">
            <p className="truncate text-sm font-bold">{fullName(user) || "کاربر قهوینو"}</p>
            <p className="latin mt-0.5 text-[0.7rem] text-ash-600">{maskPhone(user.phone)}</p>
          </div>

          <ul className="pt-2">
            {MENU_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-cream-100"
                  >
                    <Icon className="size-[18px] text-ash-600" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-1 border-t border-beige-300/60 pt-1">
              <button
                type="button"
                role="menuitem"
                data-testid="header-logout"
                onClick={() => {
                  setOpen(false);
                  signOut();
                  toast({
                    tone: "info",
                    title: "از حساب خود خارج شدید",
                    description: "سبد خرید شما محفوظ ماند.",
                  });
                  router.replace("/");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <LogoutIcon className="size-[18px]" />
                خروج از حساب
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-accent-600 text-[0.7rem] font-black text-white",
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
