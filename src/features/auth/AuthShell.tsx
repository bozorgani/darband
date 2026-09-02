import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { ArrowLeftIcon, LockIcon } from "@/components/ui/Icons";
import { brand } from "@/data/site";

/**
 * Editorial split layout shared by every auth step.
 * Server Component — only the forms inside it are interactive.
 */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100svh_-_4.75rem)] grid-cols-1 lg:min-h-[calc(100svh_-_5.5rem)] lg:grid-cols-[1.05fr_0.95fr]">
      {/* Form column */}
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-ash-600 transition-colors hover:text-espresso-900"
          >
            <ArrowLeftIcon className="size-4 rtl:rotate-180" />
            بازگشت به فروشگاه
          </Link>

          <div className="mt-8 lg:hidden">
            <Logo className="h-8" />
          </div>

          <h1 className="mt-6 text-2xl font-black text-espresso-900 sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm/7 text-ash-600">{description}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 flex items-start gap-2 rounded-2xl bg-cream-50 p-4 text-[0.7rem]/6 text-ash-600">
            <LockIcon className="mt-0.5 size-4 shrink-0 text-accent-600" />
            <span>
              شماره شما فقط برای ورود و اطلاع‌رسانی وضعیت سفارش استفاده می‌شود. با ادامه،{" "}
              <Link href="/terms" className="font-semibold text-espresso-900 underline underline-offset-4">
                قوانین
              </Link>{" "}
              و{" "}
              <Link href="/privacy" className="font-semibold text-espresso-900 underline underline-offset-4">
                حریم خصوصی
              </Link>{" "}
              قهوینو را می‌پذیرید.
            </span>
          </p>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>

      {/* Editorial column — desktop only */}
      <aside className="relative hidden overflow-hidden bg-espresso-900 lg:block">
        <Image
          src="/images/roastery.jpg"
          alt=""
          fill
          sizes="45vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/50 to-transparent" />
        <div className="grain absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream-50">
          <Logo className="h-9" />
          <div>
            <p className="eyebrow text-accent-400">{brand.latinName}</p>
            <p className="mt-4 max-w-sm text-2xl/[1.6] font-bold">«{brand.claim}»</p>
            <p className="mt-4 max-w-sm text-sm/7 text-cream-100/70">
              با ورود به حساب کاربری، سفارش‌ها، نشانی‌ها و قهوه‌های موردعلاقه‌تان همیشه یک‌جا در
              دسترس است.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
