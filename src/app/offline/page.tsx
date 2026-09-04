import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { OfflineActions } from "@/components/pwa/OfflineActions";

export const metadata: Metadata = {
  title: "اتصال اینترنت در دسترس نیست",
  description: "صفحه آفلاین قهوینو",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
  openGraph: undefined,
  twitter: undefined,
};

export default function OfflinePage() {
  return (
    <section className="container-page flex min-h-[calc(100svh-12rem)] items-center justify-center py-12">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-beige-300/70 bg-cream-50 px-6 py-12 text-center shadow-[0_28px_80px_-40px_rgba(34,21,14,0.45)] sm:px-12">
        <div aria-hidden="true" className="absolute -start-20 -top-24 size-64 rounded-full bg-accent-400/15 blur-3xl" />
        <Logo className="relative mx-auto h-11 justify-center text-espresso-900" />
        <p className="eyebrow relative mt-10">حالت آفلاین</p>
        <h1 className="relative mt-3 text-3xl leading-tight text-espresso-900 sm:text-4xl">
          اتصال اینترنت در دسترس نیست
        </h1>
        <p className="relative mx-auto mt-4 max-w-md text-sm/7 text-ash-600 sm:text-base/8">
          برای مشاهده قیمت و موجودی تازه یا ادامه خرید، اتصال اینترنت را بررسی کنید. بعضی
          صفحه‌هایی که قبلاً دیده‌اید ممکن است به‌صورت محدود در دسترس باشند.
        </p>
        <OfflineActions />
      </div>
    </section>
  );
}
