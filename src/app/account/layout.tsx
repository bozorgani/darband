import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountGuard } from "@/features/account/AccountGuard";
import { AccountProvider } from "@/features/account/AccountProvider";
import { AccountShell } from "@/features/account/AccountShell";

export const metadata: Metadata = {
  title: { default: "حساب کاربری", template: "%s | حساب کاربری دربند" },
  /* Private area: never indexed, never in the sitemap. */
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: undefined },
  openGraph: undefined,
  twitter: undefined,
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AccountGuard>
      <AccountProvider>
        <AccountShell>{children}</AccountShell>
      </AccountProvider>
    </AccountGuard>
  );
}
