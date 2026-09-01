import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEntry } from "@/features/auth/VerifyEntry";

export const metadata: Metadata = {
  title: "تأیید شماره موبایل",
  description: "کد یک‌بارمصرف ارسال‌شده به موبایل خود را وارد کنید.",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
  openGraph: undefined,
  twitter: undefined,
};

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEntry />
    </Suspense>
  );
}
