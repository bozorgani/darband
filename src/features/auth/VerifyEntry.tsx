"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Primitives";
import { useAuth } from "./AuthProvider";
import { AuthShell } from "./AuthShell";
import { OtpForm } from "./OtpForm";
import { CompleteProfileForm } from "./CompleteProfileForm";

type Step = "otp" | "profile";

/** `/auth/verify` — OTP entry, plus profile completion for brand-new accounts. */
export function VerifyEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? undefined;
  const { pendingPhone, hydrated, isAuthenticated, user } = useAuth();
  const [step, setStep] = useState<Step>("otp");

  /* Landing here without a pending challenge (direct link, cleared storage)
     is a dead end — send the visitor back to step 1. */
  useEffect(() => {
    if (!hydrated) return;
    if (!pendingPhone && !isAuthenticated) router.replace("/auth");
  }, [hydrated, pendingPhone, isAuthenticated, router]);

  /* Signed in with a finished profile? Nothing left to do here. */
  useEffect(() => {
    if (hydrated && isAuthenticated && step === "otp" && user?.firstName) {
      router.replace(next && next.startsWith("/") ? next : "/account");
    }
  }, [hydrated, isAuthenticated, step, user, next, router]);

  const profileStep = step === "profile";

  return (
    <AuthShell
      title={profileStep ? "تکمیل اطلاعات حساب" : "تأیید شماره موبایل"}
      description={
        profileStep
          ? "چند اطلاعات کوتاه تا حساب شما ساخته شود. همیشه می‌توانید بعداً آن‌ها را ویرایش کنید."
          : "کد پنج‌رقمی ارسال‌شده را وارد کنید تا وارد حساب کاربری خود شوید."
      }
    >
      {!hydrated ? (
        <div className="space-y-4" aria-hidden="true">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-13 w-full rounded-full" />
        </div>
      ) : profileStep ? (
        <CompleteProfileForm next={next} />
      ) : (
        <OtpForm next={next} onNewUser={() => setStep("profile")} />
      )}
    </AuthShell>
  );
}
