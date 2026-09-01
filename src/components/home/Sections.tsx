import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts, getBestSellers, getProductBySlug } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { SectionHeader } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpLeftIcon, BeanIcon, FlameIcon, LeafIcon } from "@/components/ui/Icons";
import { Badge, Price, Rating } from "@/components/ui/Primitives";
import { ButtonLink } from "@/components/ui/Button";
import { roastLabels } from "@/data/categories";
import { toPersianDigits } from "@/lib/format";

/* --------------------------- Featured products ---------------------------- */

export function FeaturedProducts() {
  const products = getFeaturedProducts(4);

  return (
    <section className="container-page py-20 lg:py-24" aria-labelledby="featured-title">
      <SectionHeader
        eyebrow="منتخب این فصل"
        title="لات‌هایی که این روزها می‌نوشیم"
        description="هر لات پیش از ورود به فروشگاه در جلسه کاپینگ هفتگی امتیاز می‌گیرد."
        action={
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-espresso-900"
          >
            همه محصولات
            <ArrowUpLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
          </Link>
        }
      />

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 70}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Coffee story ------------------------------ */

export function CoffeeStory() {
  const product = getProductBySlug("ethiopia-yirgacheffe");
  if (!product) return null;

  const facts = [
    { icon: <LeafIcon className="size-4" />, label: "خاستگاه", value: `${product.origin?.country} — ${product.origin?.region}` },
    { icon: <BeanIcon className="size-4" />, label: "فرآوری", value: product.origin?.process ?? "—" },
    { icon: <FlameIcon className="size-4" />, label: "درجه رست", value: roastLabels[product.roast ?? "light"] },
  ];

  return (
    <section className="relative overflow-hidden bg-espresso-950 text-cream-50 grain" aria-labelledby="story-title">
      <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-28">
        <Reveal className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-3xl sm:aspect-3/2 lg:aspect-4/5">
            <Image
              src="/images/story.jpg"
              alt="برداشت دستی گیلاس‌های قهوه در مزارع یرگاچف"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 start-6 hidden rounded-2xl bg-offwhite p-5 text-espresso-900 shadow-2xl sm:block">
            <p className="text-[0.7rem] text-ash-600">امتیاز کاپینگ</p>
            <p className="mt-1 text-3xl font-black">{toPersianDigits(88)}</p>
            <p className="mt-1 text-[0.7rem] text-ash-600">از ۱۰۰ — SCA</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="eyebrow text-accent-400">داستان یک لات</p>
          <h2 id="story-title" className="mt-3 text-3xl leading-tight text-cream-50 sm:text-4xl">
            کوچره؛ جایی که مه پیش از آفتاب می‌رسد
          </h2>
          <div className="mt-5 space-y-4 text-sm/8 text-cream-100/70">
            <p>
              در ارتفاع ۲۰۵۰ متری یرگاچف، برداشت هنوز کاملاً دستی است. تنها گیلاس‌های سرخ چیده
              می‌شوند و همان روز به ایستگاه شست‌وشو می‌رسند.
            </p>
            <p>
              دانه‌ها ۳۶ ساعت تخمیر می‌شوند، روی تخت‌های آفریقایی زیر آفتاب ملایم خشک می‌شوند و
              سپس با کشتی به تهران می‌آیند تا در رست‌خانه ما به فنجان شما تبدیل شوند.
            </p>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl border border-cream-100/12 bg-cream-100/5 p-4">
                <dt className="flex items-center gap-2 text-[0.7rem] text-cream-100/55">
                  <span className="text-accent-400">{f.icon}</span>
                  {f.label}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-cream-50">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs text-cream-100/55">نت‌های طعمی:</span>
            {product.flavorNotes.map((n) => (
              <span
                key={n}
                className="rounded-full border border-cream-100/20 px-3 py-1 text-xs text-cream-100/85"
              >
                {n}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={`/product/${product.slug}`} variant="light" size="lg">
              خرید این لات
            </ButtonLink>
            <ButtonLink
              href="/journal/farm-to-cup-ethiopia"
              size="lg"
              className="border border-cream-100/25 bg-transparent text-cream-50 shadow-none hover:bg-cream-100/10"
            >
              خواندن گزارش سفر
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Best sellers ------------------------------ */

export function BestSellers() {
  const [hero, ...others] = getBestSellers(5);
  if (!hero) return null;

  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="bestsellers-title">
      <SectionHeader
        eyebrow="پرفروش‌ترین‌ها"
        title="انتخاب هزاران فنجان"
        description="محبوب‌ترین محصولات دربند در سه ماه گذشته، بر اساس سفارش‌های واقعی مشتریان."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        {/* Hero best seller */}
        <Reveal>
          <article className="group relative flex h-full min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-cream-100">
            <Image
              src={hero.images[0]}
              alt={hero.title}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/92 via-espresso-950/35 to-transparent" aria-hidden="true" />
            <div className="relative z-10 p-7 text-cream-50">
              <Badge tone="accent">شماره یک فروش</Badge>
              <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                <Link href={`/product/${hero.slug}`} className="after:absolute after:inset-0">
                  {hero.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-md text-sm/7 text-cream-100/75">{hero.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Rating value={hero.rating} count={hero.reviewCount} className="[&_span]:text-cream-100" />
                <span className="text-lg font-bold">
                  {toPersianDigits(hero.price.toLocaleString("en-US"))}
                  <span className="ms-1 text-xs font-medium text-cream-100/70">تومان</span>
                </span>
              </div>
            </div>
          </article>
        </Reveal>

        {/* Ranked list */}
        <ol className="flex flex-col divide-y divide-beige-300/60">
          {others.map((product, i) => (
            <li key={product.id}>
              <Reveal delay={i * 60}>
                <div className="group relative flex items-center gap-4 py-5">
                  <span className="w-6 shrink-0 text-center text-sm font-black text-beige-300 transition-colors group-hover:text-accent-500">
                    {toPersianDigits(i + 2)}
                  </span>
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cream-100"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="80px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-espresso-900">
                      <Link href={`/product/${product.slug}`} className="hover:text-accent-600">
                        {product.title}
                      </Link>
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ash-600">{product.tagline}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <Price value={product.price} compareAt={product.compareAtPrice} size="sm" />
                    </div>
                  </div>
                  <Rating value={product.rating} showValue={false} className="hidden sm:flex" />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
