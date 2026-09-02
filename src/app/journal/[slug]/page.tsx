import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticleBySlug } from "@/data/articles";
import { Breadcrumb } from "@/components/ui/Disclosure";
import { formatReadingTime } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/data/site";
import { absoluteUrl, sharedOpenGraph, siteConfig } from "@/config/site";
import { jalaliToIsoDate } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "مقاله پیدا نشد" };

  const published = jalaliToIsoDate(article.date);

  return {
    title: { absolute: `${article.title} | مجله قهوینو` },
    description: article.excerpt,
    alternates: { canonical: `/journal/${article.slug}` },
    openGraph: {
      ...sharedOpenGraph,
      type: "article",
      url: absoluteUrl(`/journal/${article.slug}`),
      title: article.title,
      description: article.excerpt,
      ...(published ? { publishedTime: published } : {}),
      images: [{ url: article.image, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  const published = jalaliToIsoDate(article.date);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: absoluteUrl(article.image),
    inLanguage: siteConfig.languageTag,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/journal/${article.slug}`),
    },
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "Organization", name: brand.name },
    /* Real content date only — never a build timestamp. */
    ...(published ? { datePublished: published, dateModified: published } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "ژورنال", item: absoluteUrl("/journal") },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: absoluteUrl(`/journal/${article.slug}`),
      },
    ],
  };

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

      <article>
        <header className="container-page pt-8">
          <Breadcrumb
            items={[
              { label: "خانه", href: "/" },
              { label: "ژورنال", href: "/journal" },
              { label: article.title },
            ]}
          />
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <span className="eyebrow">{article.category}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-espresso-900 sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base/8 text-ash-600">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-ash-600">
              <span className="font-semibold text-espresso-800">{article.author}</span>
              <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
              <span>{article.date}</span>
              <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
              <span>{formatReadingTime(article.readingTime)}</span>
            </div>
          </div>
        </header>

        <div className="container-page mt-10">
          <div className="relative mx-auto aspect-16/9 max-w-5xl overflow-hidden rounded-3xl bg-cream-100">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="container-page py-14">
          <div className="mx-auto max-w-2xl">
            {article.body.map((block, i) => (
              <section key={i} className="mb-8">
                {block.heading && (
                  <h2 className="mb-3 text-xl font-bold text-espresso-900 sm:text-2xl">
                    {block.heading}
                  </h2>
                )}
                {block.paragraphs.map((p) => (
                  <p key={p} className="mb-4 text-[0.95rem]/9 text-espresso-800/85">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <div className="mt-10 flex flex-wrap gap-2 border-t border-beige-300/70 pt-6">
              {article.tags.map((t) => (
                <span key={t} className="rounded-full bg-cream-100 px-3 py-1 text-xs text-espresso-800">
                  #{t}
                </span>
              ))}
            </div>

            <div className="mt-10 rounded-3xl bg-espresso-950 p-8 text-center text-cream-50 grain relative overflow-hidden">
              <h2 className="text-xl font-bold sm:text-2xl">آماده‌اید امتحان کنید؟</h2>
              <p className="mx-auto mt-3 max-w-md text-sm/7 text-cream-100/70">
                لات‌های فعال این فصل را ببینید و همین امروز دم‌آوری را شروع کنید.
              </p>
              <ButtonLink href="/shop" variant="light" size="lg" className="mt-6">
                مشاهده فروشگاه
              </ButtonLink>
            </div>
          </div>
        </div>
      </article>

      {/* Related */}
      <section className="container-page pb-20" aria-labelledby="related-articles">
        <h2 id="related-articles" className="mb-8 text-xl font-bold text-espresso-900">
          مقاله‌های مرتبط
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {related.map((a) => (
            <article key={a.slug} className="group">
              <Link
                href={`/journal/${a.slug}`}
                className="relative block aspect-4/3 overflow-hidden rounded-2xl bg-cream-100"
              >
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
              <h3 className="mt-3 text-base font-bold leading-snug text-espresso-900">
                <Link href={`/journal/${a.slug}`} className="hover:text-accent-600">
                  {a.title}
                </Link>
              </h3>
              <p className="mt-1.5 text-[0.7rem] text-ash-600">{formatReadingTime(a.readingTime)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
