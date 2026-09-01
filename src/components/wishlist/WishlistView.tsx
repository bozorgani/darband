"use client";

import { useStore } from "@/store/store";
import { products } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/Feedback";
import { HeartIcon, BagIcon, TrashIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { ProductGridSkeleton } from "@/components/ui/Primitives";
import { toPersianDigits } from "@/lib/format";
import { useToast } from "@/store/toast";

export function WishlistView({ embedded = false }: { embedded?: boolean } = {}) {
  const { wishlist, hydrated, addProduct, removeWishlist } = useStore();
  const { toast } = useToast();

  const saved = products.filter((p) => wishlist.includes(p.id));

  /* `embedded` renders inside the account shell, which already provides
     the page container, heading and spacing. */
  const wrapper = embedded ? "" : "container-page py-12";

  if (!hydrated) {
    return (
      <div className={wrapper}>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className={wrapper}>
        <EmptyState
          icon={<HeartIcon className="size-7" />}
          title="فهرست علاقه‌مندی‌ها خالی است"
          description="با زدن آیکون قلب روی هر محصول، آن را برای بعد ذخیره کنید تا همیشه در دسترس باشد."
          actionLabel="کشف محصولات"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "container-page py-10 lg:py-12"}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ash-600">
          {toPersianDigits(saved.length)} محصول ذخیره شده است.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              saved.filter((p) => p.inStock).forEach((p) => addProduct(p));
            }}
          >
            <BagIcon className="size-4" />
            افزودن همه به سبد
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              saved.forEach((p) => removeWishlist(p.id));
              toast({ tone: "danger", title: "فهرست علاقه‌مندی‌ها پاک شد" });
            }}
          >
            <TrashIcon className="size-4" />
            پاک کردن فهرست
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
        {saved.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
