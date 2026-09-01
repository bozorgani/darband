"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { mainNav, brand } from "@/data/site";
import { useScrollState } from "@/hooks";
import { useStore } from "@/store/store";
import { BagIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { toPersianDigits } from "@/lib/format";
import { Logo } from "./Logo";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const pathname = usePathname();
  const { scrolled, hidden } = useScrollState();
  const { itemCount, wishlist, setCartOpen, setSearchOpen, setNavOpen, hydrated } = useStore();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /** Homepage has a full-bleed dark hero, so the header starts transparent. */
  const overHero = pathname === "/" && !scrolled;

  /* Close the mega-menu when the route changes (render-phase reset). */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenMenu(null);
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-x-0 focus:top-3 focus:z-[130] focus:mx-auto focus:w-fit focus:rounded-full focus:bg-espresso-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-cream-50"
      >
        رفتن به محتوای اصلی
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          hidden && !openMenu ? "-translate-y-full" : "translate-y-0",
          overHero
            ? "bg-transparent text-cream-50"
            : "border-b border-beige-300/60 bg-offwhite/85 text-espresso-900 backdrop-blur-xl",
        )}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-page">
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-all duration-400",
              scrolled ? "h-16" : "h-[4.75rem] lg:h-[5.5rem]",
            )}
          >
            {/* Mobile: menu */}
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="باز کردن منو"
              className="-ms-2 flex size-10 items-center justify-center rounded-full transition hover:bg-current/10 lg:hidden"
            >
              <MenuIcon className="size-6" />
            </button>

            {/* Desktop nav */}
            <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 lg:order-1 lg:me-auto lg:ms-6 lg:flex">
              {mainNav.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.children ? item.label : null)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={item.children ? openMenu === item.label : undefined}
                    className={cn(
                      "relative flex h-10 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-200",
                      "after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100",
                      pathname === item.href && "after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>

                  {item.children && openMenu === item.label && (
                    <div className="absolute start-0 top-full w-72 pt-2">
                      <div className="overflow-hidden rounded-2xl border border-beige-300/70 bg-offwhite p-2 text-espresso-900 shadow-[0_24px_60px_-24px_rgba(34,21,14,0.45)] animate-scale-in">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-cream-100"
                          >
                            <span className="block text-sm font-semibold">{child.label}</span>
                            {child.description && (
                              <span className="mt-0.5 block text-[0.7rem] text-ash-600">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Logo */}
            <Link
              href="/"
              aria-label={`${brand.name} — صفحه اصلی`}
              className="absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2 lg:static lg:order-first lg:translate-x-0"
            >
              <Logo className={cn("transition-all duration-400", scrolled ? "h-7" : "h-8 lg:h-9")} />
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-0.5 lg:order-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="جستجو در فروشگاه"
                className="flex size-10 items-center justify-center rounded-full transition hover:bg-current/10"
              >
                <SearchIcon className="size-[22px]" />
              </button>

              <Link
                href="/wishlist"
                aria-label={`علاقه‌مندی‌ها${hydrated && wishlist.length ? ` (${toPersianDigits(wishlist.length)} مورد)` : ""}`}
                className="relative hidden size-10 items-center justify-center rounded-full transition hover:bg-current/10 sm:flex"
              >
                <HeartIcon className="size-[22px]" />
                {hydrated && wishlist.length > 0 && (
                  <span className="absolute -top-0.5 end-0.5 flex min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[0.6rem] font-bold text-white">
                    {toPersianDigits(wishlist.length)}
                  </span>
                )}
              </Link>

              <AccountMenu />

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`سبد خرید${hydrated && itemCount ? ` (${toPersianDigits(itemCount)} مورد)` : " (خالی)"}`}
                className="relative flex size-10 items-center justify-center rounded-full transition hover:bg-current/10"
              >
                <BagIcon className="size-[22px]" />
                {hydrated && itemCount > 0 && (
                  <span className="absolute -top-0.5 end-0.5 flex min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[0.6rem] font-bold text-white">
                    {toPersianDigits(itemCount)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
