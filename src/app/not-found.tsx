import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { BeanIcon } from "@/components/ui/Icons";
import { popularSearches } from "@/data/site";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-cream-100 text-espresso-800">
        <BeanIcon className="size-9" />
      </span>
      <p className="mt-8 text-6xl font-black text-espresso-900">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-bold text-espresso-900 sm:text-3xl">
        این صفحه مثل آخرین جرعه قهوه، تمام شده است
      </h1>
      <p className="mt-3 max-w-md text-sm/7 text-ash-600">
        نشانی‌ای که دنبالش بودید پیدا نشد. شاید محصول از کاتالوگ خارج شده یا لینک تغییر کرده باشد.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/" size="lg">
          بازگشت به صفحه اصلی
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline" size="lg">
          رفتن به فروشگاه
        </ButtonLink>
      </div>
      <div className="mt-10">
        <p className="text-xs text-ash-600">جستجوهای پرطرفدار:</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {popularSearches.slice(0, 4).map((term) => (
            <Link
              key={term}
              href={`/shop?q=${encodeURIComponent(term)}`}
              className="rounded-full bg-cream-100 px-3.5 py-1.5 text-xs font-medium text-espresso-800 transition hover:bg-espresso-900 hover:text-cream-50"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
