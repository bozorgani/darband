"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Primitives";
import { useAuth } from "@/features/auth/AuthProvider";

/**
 * Client-side route guard for `/account/*`.
 *
 * ⚠️ This is a UX guard for the demo only — it hides the panel from visitors
 * who are not "signed in" with the mock session. It is NOT security: there is
 * no server, so nothing here can protect real data.
 * TODO(backend): enforce access in middleware against a real session cookie.
 */
export function AccountGuard({ children }: { children: ReactNode }) {
  const { hydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  /* Skeleton during hydration + the redirect frame, so protected content
     never flashes for signed-out visitors. */
  if (!hydrated || !isAuthenticated) {
    return <AccountSkeleton signedOut={hydrated && !isAuthenticated} />;
  }

  return <>{children}</>;
}

function AccountSkeleton({ signedOut }: { signedOut: boolean }) {
  return (
    <div className="container-page py-10 lg:py-14" data-testid="account-skeleton">
      <p className="sr-only" role="status" aria-live="polite">
        {signedOut ? "در حال انتقال به صفحه ورود" : "در حال بارگذاری حساب کاربری"}
      </p>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <div className="hidden flex-col gap-3 lg:flex">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-28 w-full rounded-3xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
