import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/data/products";
import { getReviewsForProduct } from "@/data/reviews";
import { roastLabels, brewLabels, getCategory } from "@/data/categories";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import { BrewingGuide } from "@/components/products/BrewingGuide";
import { ProductCard } from "@/components/products/ProductCard";
import { Accordion, Breadcrumb } from "@/components/ui/Disclosure";
import { Rating } from "@/components/ui/Primitives";
import { SectionHeader } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";
import { toPersianDigits } from "@/lib/format";
import { brand } from "@/data/site";
import { absoluteUrl, sharedOpenGraph, siteConfig } from "@/config/site";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "محصول پیدا نشد" };

  const origin =
    product.origin?.country ?? (product.roast ? roastLabels[product.roast] : product.tagline);

  return {
    title: `خرید ${product.title}، ${origin}`,
    description: product.description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      ...sharedOpenGraph,
      type: "website",
      url: absoluteUrl(`/product/${product.slug}`),
      title: `${product.title}، ${origin} | ${brand.name}`,
      description: product.description,
      images: [{ url: product.images[0], width: 1200, height: 1200, alt: product.title }],
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const reviews = getReviewsForProduct(slug);
  const related = getRelatedProducts(slug, 4);
  const category = getCategory(product.category);

  /* Product structured data for rich results.
     UI prices are Toman; schema.org needs the ISO currency, so IRR = Toman×10. */
  const priceRial = product.price * 10;
  const hasReviews = reviews.length > 0 && product.reviewCount > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((src) => absoluteUrl(src)),
    sku: product.id,
    inLanguage: siteConfig.languageTag,
    brand: { "@type": "Brand", name: brand.name },
    ...(hasReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 3).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.author },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: priceRial,
      priceCurrency: "IRR",
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "فروشگاه", item: absoluteUrl("/shop") },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.title,
              item: absoluteUrl(`/shop?category=${category.slug}`),
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.title,
        item: absoluteUrl(`/product/${product.slug}`),
      },
    ],
  };

  const specs = [
    product.origin?.country && { label: "کشور", value: product.origin.country },
    product.origin?.region && { label: "منطقه", value: product.origin.region },
    product.origin?.farm && { label: "مزرعه / ایستگاه", value: product.origin.farm },
    product.origin?.altitude && { label: "ارتفاع", value: product.origin.altitude },
    product.origin?.process && { label: "فرآوری", value: product.origin.process },
    product.origin?.varietal && { label: "واریته", value: product.origin.varietal },
    product.roast && { label: "درجه رست", value: roastLabels[product.roast] },
    ...(product.specs ?? []),
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="container-page pt-6">
        <Breadcrumb
          items={[
            { label: "خانه", href: "/" },
            { label: "فروشگاه", href: "/shop" },
            ...(category ? [{ label: category.title, href: `/shop?category=${category.slug}` }] : []),
            { label: product.title },
          ]}
        />
      </div>

      {/* Main */}
      <div className="container-page grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <ProductGallery images={product.images} title={product.title} badges={product.badges} />
        <ProductPurchase product={product} />
      </div>

      {/* Flavor profile */}
      <section className="container-page pb-4" aria-labelledby="profile-title">
        <div className="grid gap-6 rounded-3xl bg-cream-100/70 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          <div>
            <h2 id="profile-title" className="text-xs font-bold text-espresso-900">
              نت‌های طعمی
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.flavorNotes.length ? (
                product.flavorNotes.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-offwhite px-3 py-1 text-xs text-espresso-800"
                  >
                    {n}
                  </span>
                ))
              ) : (
                <span className="text-xs text-ash-600">—</span>
              )}
            </div>
          </div>

          <Meter label="شدت" value={product.intensity ?? 0} />
          <Meter label="اسیدیته" value={product.acidity ?? 0} />

          <div>
            <h2 className="text-xs font-bold text-espresso-900">روش‌های پیشنهادی</h2>
            <p className="mt-3 text-xs/6 text-ash-600">
              {product.brewMethods.map((b) => brewLabels[b]).join("، ")}
            </p>
          </div>
        </div>
      </section>

      {/* Details accordion */}
      <section className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="mb-4 text-xl font-bold text-espresso-900">اطلاعات تکمیلی</h2>
          <Accordion
            defaultOpen="about"
            items={[
              {
                id: "about",
                title: "درباره این قهوه",
                content: (
                  <div className="space-y-3">
                    {product.longDescription.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                ),
              },
              {
                id: "brewing",
                title: "روش پیشنهادی دم‌آوری",
                content: (
                  <p>
                    {product.brewingTip ??
                      "برای این محصول دستور دم‌آوری خاصی لازم نیست؛ راهنمای کلی قهوینو را دنبال کنید."}
                  </p>
                ),
              },
              {
                id: "specs",
                title: "مشخصات",
                content: (
                  <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {specs.map((s) => (
                      <div key={s.label} className="flex justify-between gap-3 border-b border-beige-300/50 py-1.5">
                        <dt className="text-ash-600">{s.label}</dt>
                        <dd className="font-semibold text-espresso-900">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                ),
              },
              {
                id: "shipping",
                title: "ارسال",
                content: (
                  <p>
                    سفارش‌های ثبت‌شده تا ساعت ۱۴ همان روز رست و ارسال می‌شوند. ارسال به تهران
                    ۲۴ ساعته و به سایر شهرها بین ۲ تا ۴ روز کاری است. سفارش‌های بالای ۱٬۵۰۰٬۰۰۰
                    تومان رایگان ارسال می‌شوند.
                  </p>
                ),
              },
              {
                id: "returns",
                title: "بازگشت کالا",
                content: (
                  <p>
                    تا ۷ روز پس از دریافت، در صورت باز نشدن بسته می‌توانید کالا را مرجوع کنید. اگر
                    از کیفیت قهوه راضی نبودید، با پشتیبانی تماس بگیرید تا لات جایگزین ارسال شود.
                  </p>
                ),
              },
            ]}
          />
        </div>

        {/* Reviews */}
        <div id="reviews" className="scroll-mt-28">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-espresso-900">
              نظر مشتریان
              <span className="ms-2 text-sm font-normal text-ash-600">
                ({toPersianDigits(product.reviewCount)})
              </span>
            </h2>
            <Rating value={product.rating} size="md" />
          </div>

          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-beige-300 p-8 text-center text-sm text-ash-600">
              هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!
            </p>
          ) : (
            <ul className="divide-y divide-beige-300/60">
              {reviews.map((review) => (
                <li key={review.id} className="py-5 first:pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-espresso-900">{review.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-ash-600">
                        {review.author}
                        {review.verified && (
                          <span className="rounded-full bg-success/12 px-2 py-0.5 font-semibold text-success">
                            خرید تأییدشده
                          </span>
                        )}
                        <span>{review.date}</span>
                      </p>
                    </div>
                    <Rating value={review.rating} showValue={false} />
                  </div>
                  <p className="mt-2.5 text-sm/7 text-ash-600">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
          {/* TODO(backend): submitting a review requires an authenticated API. */}
        </div>
      </section>

      <BrewingGuide />

      {/* Related */}
      <section className="container-page py-16 lg:py-20" aria-labelledby="related-title">
        <SectionHeader eyebrow="شاید بپسندید" title="محصولات مرتبط" />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
          {related.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-espresso-900">{label}</h2>
        <span className="text-[0.7rem] text-ash-600">
          {toPersianDigits(value)} از {toPersianDigits(5)}
        </span>
      </div>
      <div className="mt-3 flex gap-1" role="img" aria-label={`${label}: ${toPersianDigits(value)} از ۵`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= value ? "bg-accent-600" : "bg-beige-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
