import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import { SectionHeader } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpLeftIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Editorial category mosaic — deliberately not a row of identical cards.
 */
export function CategoryShowcase() {
  const [first, second, third, ...rest] = categories.filter((c) => c.featured);

  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="categories-title">
      <SectionHeader
        eyebrow="دسته‌بندی‌ها"
        title="از کجا شروع کنیم؟"
        description="کاتالوگ دربند بر اساس روش دم‌آوری و سبک زندگی شما دسته‌بندی شده است."
        action={
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-espresso-900"
          >
            مشاهده همه محصولات
            <ArrowUpLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
          </Link>
        }
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {first && <CategoryTile category={first} className="lg:col-span-2 lg:row-span-2" size="lg" />}
        {second && <CategoryTile category={second} className="lg:col-span-2" size="md" />}
        {third && <CategoryTile category={third} size="sm" />}
        {rest[0] && <CategoryTile category={rest[0]} size="sm" />}
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  className,
  size = "sm",
}: {
  category: (typeof categories)[number];
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Reveal className={cn("h-full", className)}>
      <Link
        href={`/shop?category=${category.slug}`}
        className={cn(
          "group relative flex h-full items-end overflow-hidden rounded-3xl bg-espresso-900 text-cream-50",
          size === "lg" ? "min-h-[22rem] lg:min-h-[34rem]" : size === "md" ? "min-h-[16rem]" : "min-h-[15rem]",
        )}
      >
        <Image
          src={category.image}
          alt={category.title}
          fill
          loading="lazy"
          sizes={size === "lg" ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
          className="object-cover opacity-80 transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-65"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/30 to-transparent"
          aria-hidden="true"
        />
        <div className="relative z-10 w-full p-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-accent-400">
            {category.subtitle}
          </p>
          <h3 className={cn("mt-2 font-bold", size === "lg" ? "text-3xl" : "text-xl")}>
            {category.title}
          </h3>
          {size !== "sm" && (
            <p className="mt-2 max-w-sm text-xs/6 text-cream-100/70">{category.description}</p>
          )}
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold">
            مشاهده محصولات
            <ArrowUpLeftIcon className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
