"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { InfoIcon, RefreshIcon } from "@/components/ui/Icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(backend): forward to an error-reporting service.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-danger/10 text-danger">
        <InfoIcon className="size-9" />
      </span>
      <h1 className="mt-8 text-2xl font-bold text-espresso-900 sm:text-3xl">
        مشکلی در نمایش این بخش پیش آمد
      </h1>
      <p className="mt-3 max-w-md text-sm/7 text-ash-600">
        خطای غیرمنتظره‌ای رخ داده است. می‌توانید دوباره تلاش کنید یا به صفحه اصلی بازگردید. اگر
        مشکل ادامه داشت با پشتیبانی تماس بگیرید.
      </p>
      {error.digest && (
        <p className="latin mt-3 text-[0.7rem] text-ash-400">کد خطا: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RefreshIcon className="size-4" />
          تلاش دوباره
        </Button>
        <ButtonLink href="/" variant="outline" size="lg">
          صفحه اصلی
        </ButtonLink>
      </div>
    </div>
  );
}
