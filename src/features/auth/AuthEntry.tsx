"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { AuthShell } from "./AuthShell";
import { PhoneForm } from "./PhoneForm";
import { Skeleton } from "@/components/ui/Primitives";

/** `/auth` — step 1 of the unified sign-in / sign-up flow. */
export function AuthEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const { isAuthenticated, hydrated } = useAuth();

  /* Already signed in? Skip the flow. */
  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(next && next.startsWith("/") ? next : "/account");
    }
  }, [hydrated, isAuthenticated, next, router]);

  return (
    <AuthShell
      title="ورود یا ثبت‌نام"
      description="شماره موبایل خود را وارد کنید. اگر قبلاً خرید کرده‌اید وارد حساب می‌شوید، در غیر این صورت حساب جدیدی برایتان ساخته می‌شود."
    >
      {!hydrated || isAuthenticated ? (
        <div className="space-y-3" aria-hidden="true">
          <Skeleton className="h-13 w-full rounded-full" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      ) : (
        <PhoneForm next={next} />
      )}
    </AuthShell>
  );
}
