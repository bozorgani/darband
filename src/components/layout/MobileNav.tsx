"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/ui/Overlay";
import { useStore } from "@/store/store";
import { mainNav, socialLinks } from "@/data/site";
import { ChevronDownIcon, HeartIcon, SearchIcon, socialIcons } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export function MobileNav() {
  const { navOpen, setNavOpen, setSearchOpen } = useStore();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Close the drawer whenever navigation happens. This writes to state owned
     by StoreProvider, so it must run in an effect rather than during render. */
  useEffect(() => setNavOpen(false), [pathname, setNavOpen]);

  return (
    <Drawer
      open={navOpen}
      onClose={() => setNavOpen(false)}
      title="منو"
      description="فروشگاه قهوه‌های تخصصی دربند"
    >
      <div className="p-5">
        <button
          type="button"
          onClick={() => {
            setNavOpen(false);
            setSearchOpen(true);
          }}
          className="mb-6 flex h-12 w-full items-center gap-3 rounded-full border border-espresso-900/15 px-5 text-sm text-ash-600 transition hover:border-espresso-900/35"
        >
          <SearchIcon className="size-5" />
          جستجوی قهوه، تجهیزات، مقاله…
        </button>

        <nav aria-label="ناوبری موبایل">
          <ul className="divide-y divide-beige-300/60">
            {mainNav.map((item) => (
              <li key={item.label} className="py-1">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                      aria-expanded={expanded === item.label}
                      className="flex w-full items-center justify-between py-3 text-start text-base font-bold text-espresso-900"
                    >
                      {item.label}
                      <ChevronDownIcon
                        className={cn(
                          "size-4 text-ash-600 transition-transform duration-300",
                          expanded === item.label && "rotate-180",
                        )}
                      />
                    </button>
                    {expanded === item.label && (
                      <ul className="mb-2 space-y-0.5 border-s-2 border-beige-300 ps-4 animate-fade-in">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className="block py-2 text-sm text-ash-600 transition-colors hover:text-espresso-900"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-bold text-espresso-900"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="py-1">
              <Link
                href="/wishlist"
                className="flex items-center gap-2 py-3 text-base font-bold text-espresso-900"
              >
                <HeartIcon className="size-5" />
                علاقه‌مندی‌ها
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-8 rounded-2xl bg-espresso-900 p-5 text-cream-50 grain relative overflow-hidden">
          <p className="text-sm font-bold">اشتراک ماهانه قهوه</p>
          <p className="mt-1.5 text-xs/6 text-cream-100/70">
            هر ماه یک خاستگاه تازه، رست‌شده در همان هفته، درب منزل شما.
          </p>
          <ButtonLink href="/#subscription" variant="light" size="sm" className="mt-4">
            مشاهده پلن‌ها
          </ButtonLink>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {socialLinks.map((s) => {
            const Icon = socialIcons[s.icon];
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex size-10 items-center justify-center rounded-full border border-espresso-900/15 text-espresso-800 transition hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50"
              >
                <Icon className="size-[18px]" />
              </a>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}
