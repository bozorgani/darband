import type { Metadata } from "next";
import { AccountPageHeader } from "@/features/account/AccountShell";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها",
  description: "محصولاتی که برای خرید بعدی ذخیره کرده‌اید.",
};

/**
 * Same store-backed wishlist as the public `/wishlist` route — one source of
 * truth, rendered inside the account chrome.
 */
export default function AccountWishlistPage() {
  return (
    <>
      <AccountPageHeader
        title="علاقه‌مندی‌ها"
        description="قهوه‌ها و تجهیزاتی که برای بعد ذخیره کرده‌اید."
        breadcrumb={[{ label: "علاقه‌مندی‌ها" }]}
      />
      <WishlistView embedded />
    </>
  );
}
