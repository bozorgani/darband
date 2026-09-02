"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { isProfileComplete } from "./auth.utils";
import { getSafeRedirectPath, isSafeInternalPath } from "./redirect";
import { AuthShell } from "./AuthShell";
import { PhoneForm } from "./PhoneForm";
import { Skeleton } from "@/components/ui/Primitives";

/** `/auth` — step 1 of the unified sign-in / sign-up flow. */
export function AuthEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const { isAuthenticated, hydrated, user } = useAuth();

  /* Already signed in? Skip the flow — but a half-registered account has to
     finish the profile step first. */
  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    if (!isProfileComplete(user)) {
      const query = isSafeInternalPath(next) ? `?next=${encodeURIComponent(next as string)}` : "";
      router.replace(`/auth/verify${query}`);
      return;
    }
    router.replace(getSafeRedirectPath(next));
  }, [hydrated, isAuthenticated, user, next, router]);

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
