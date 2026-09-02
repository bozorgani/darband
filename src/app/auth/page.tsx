import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthEntry } from "@/features/auth/AuthEntry";

export const metadata: Metadata = {
  title: "ورود یا ثبت‌نام",
  description: "ورود به حساب کاربری قهوینو با شماره موبایل.",
  /* Auth screens must never be indexed and are excluded from the sitemap. */
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
  openGraph: undefined,
  twitter: undefined,
};

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthEntry />
    </Suspense>
  );
}
