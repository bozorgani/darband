"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { articles, articleCategories, articleTags } from "@/data/articles";
import { formatReadingTime } from "@/lib/format";
import { cn, normalizeText } from "@/lib/utils";
import { SearchIcon, ArrowUpLeftIcon, BeanIcon } from "@/components/ui/Icons";
import { EmptyState } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function JournalView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const featured = articles.find((a) => a.featured) ?? articles[0];

  /* Cheap over a small local dataset — the React Compiler memoizes this. */
  const normalizedQuery = normalizeText(query);
  const filtered = articles.filter((a) => {
    if (category && a.category !== category) return false;
    if (tag && !a.tags.includes(tag)) return false;
    if (
      normalizedQuery &&
      !normalizeText(`${a.title} ${a.excerpt} ${a.tags.join(" ")}`).includes(normalizedQuery)
    )
      return false;
    return true;
  });

  const rest = filtered.filter((a) => a.slug !== featured.slug || category || tag || query);

  function reset() {
    setQuery("");
    setCategory(null);
    setTag(null);
  }

  return (
    <div className="container-page py-10 lg:py-14">
      {/* Featured */}
      {!category && !tag && !query && (
        <Reveal>
          <article className="group grid gap-8 overflow-hidden rounded-3xl bg-cream-100/60 lg:grid-cols-2 lg:items-center">
            <Link
              href={`/journal/${featured.slug}`}
              className="relative aspect-16/10 overflow-hidden lg:aspect-auto lg:h-full lg:min-h-[24rem]"
            >
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              />
            </Link>
            <div className="p-6 lg:p-10">
              <span className="eyebrow">مقاله منتخب</span>
              <h2 className="mt-3 text-2xl font-bold leading-snug text-espresso-900 sm:text-3xl">
                <Link href={`/journal/${featured.slug}`} className="transition-colors hover:text-accent-600">
                  {featured.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm/7 text-ash-600">{featured.excerpt}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[0.7rem] text-ash-600">
                <span className="font-semibold text-espresso-800">{featured.author}</span>
                <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
                <span>{featured.date}</span>
                <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
                <span>{formatReadingTime(featured.readingTime)}</span>
              </div>
              <Link
                href={`/journal/${featured.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-espresso-900"
              >
                خواندن مقاله
                <ArrowUpLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </article>
        </Reveal>
      )}

      {/* Filters */}
      <div className="mt-12 flex flex-col gap-4 border-b border-beige-300/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto">
          <FilterChip active={!category} onClick={() => setCategory(null)}>
            همه
          </FilterChip>
          {articleCategories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>

        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ash-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در مقاله‌ها…"
            aria-label="جستجو در مقاله‌ها"
            className="h-11 w-full rounded-full border border-espresso-900/15 bg-white/70 ps-11 pe-4 text-sm placeholder:text-ash-400 focus:border-accent-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ash-600">برچسب‌ها:</span>
        {articleTags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? null : t)}
            aria-pressed={tag === t}
            className={cn(
              "rounded-full px-3 py-1 text-[0.7rem] transition",
              tag === t
                ? "bg-accent-600 text-white"
                : "bg-cream-100 text-espresso-800 hover:bg-beige-200",
            )}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {rest.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={<BeanIcon className="size-7" />}
          title="مقاله‌ای پیدا نشد"
          description="عبارت دیگری را جستجو کنید یا فیلترها را بردارید."
          secondary={
            <Button variant="outline" onClick={reset}>
              بازنشانی فیلترها
            </Button>
          }
        />
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, i) => (
            <Reveal key={article.slug} delay={(i % 3) * 80}>
              <article className="group flex h-full flex-col">
                <Link
                  href={`/journal/${article.slug}`}
                  className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cream-100"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  />
                  <span className="absolute start-3 top-3 rounded-full bg-offwhite/90 px-2.5 py-1 text-[0.65rem] font-semibold text-espresso-900 backdrop-blur-sm">
                    {article.category}
                  </span>
                </Link>

                <h3 className="mt-4 text-lg font-bold leading-snug text-espresso-900">
                  <Link href={`/journal/${article.slug}`} className="transition-colors hover:text-accent-600">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm/7 text-ash-600">{article.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-[0.7rem] text-ash-600">
                  <span>{article.date}</span>
                  <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
                  <span>{formatReadingTime(article.readingTime)}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition",
        active
          ? "border-espresso-900 bg-espresso-900 text-cream-50"
          : "border-espresso-900/15 text-espresso-800 hover:border-espresso-900/45",
      )}
    >
      {children}
    </button>
  );
}
