"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function OfflineActions() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <div className="relative mt-8">
      <p role="status" aria-live="polite" className="min-h-6 text-xs font-semibold text-ash-600">
        {online === true ? "شبکه در دسترس است؛ ارتباط با فروشگاه را دوباره بررسی کنید." : online === false ? "هنوز آفلاین هستید." : ""}
      </p>
      <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
        <Button type="button" onClick={() => {
          // A document request is required because RSC responses are deliberately not cached.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          if (window.location.pathname === "/offline") window.location.assign("/");
          else window.location.reload();
        }}>
          تلاش دوباره
        </Button>
        {/* Full document navigation is intentional: RSC payloads are network-only offline. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="inline-flex h-11 items-center justify-center rounded-full border border-espresso-900/25 px-6 text-sm font-semibold">
          بازگشت به صفحه اصلی
        </a>
      </div>
    </div>
  );
}
