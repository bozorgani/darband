"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/store/toast";
import { StoreProvider } from "@/store/store";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { PwaExperience } from "@/components/pwa/PwaExperience";
import { cn } from "@/lib/utils";

/**
 * Client shell: providers + chrome.
 * Page content itself stays a Server Component wherever possible.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <Header />
          <Main>{children}</Main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <SearchOverlay />
          <PwaExperience />
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function Main({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  /** The homepage hero sits under the transparent header. */
  const flush = pathname === "/";
  return (
    <main id="main" className={cn(!flush && "pt-[4.75rem] lg:pt-[5.5rem]")}>
      {children}
    </main>
  );
}
