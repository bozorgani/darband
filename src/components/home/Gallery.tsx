import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Feedback";
import { articles } from "@/data/articles";
import { formatReadingTime } from "@/lib/format";

const gallery = [
  { src: "/images/lifestyle/1.jpg", alt: "دم‌آوری پور اور در صبح", tall: true },
  { src: "/images/products/ethiopia-2.jpg", alt: "دانه‌های تازه رست‌شده اتیوپی" },
  { src: "/images/lifestyle/3.jpg", alt: "فضای رست‌خانه قهوینو" },
  { src: "/images/lifestyle/2.jpg", alt: "فنجان اسپرسو روی میز چوبی" },
  { src: "/images/roastery.jpg", alt: "رستر در حال کار", tall: true },
  { src: "/images/lifestyle/4.jpg", alt: "لحظه‌ای از یک صبح قهوه" },
];

export function LifestyleGallery() {
  return (
    <section className="py-20 lg:py-24" aria-labelledby="gallery-title">
      <div className="container-page">
        <SectionHeader
          eyebrow="لحظه‌های قهوینو"
          title="از رست تا فنجان"
          description="نگاهی به رست‌خانه، دم‌آوری و فنجان‌هایی که هر روز کنار ما ساخته می‌شوند."
        />
      </div>

      <div className="container-page mt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {gallery.map((item, i) => (
            <Reveal
              key={item.src + i}
              delay={i * 60}
              className={item.tall ? "row-span-2" : undefined}
            >
              {/* TODO(brand): تا زمانی که حساب رسمی شبکه اجتماعی تأیید نشده،
                  این کاشی‌ها لینک بیرونی ندارند. */}
              <figure className="group relative block h-full overflow-hidden rounded-2xl bg-cream-100">
                <div className={`relative ${item.tall ? "aspect-1/2 max-lg:aspect-square" : "aspect-square"}`}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                  />
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Journal teaser ----------------------------- */

export function JournalTeaser() {
  const items = articles.slice(0, 3);

  return (
    <section className="container-page py-20 lg:py-24" aria-labelledby="journal-teaser-title">
      <SectionHeader
        eyebrow="ژورنال قهوه"
        title="بخوانید، بهتر دم کنید"
        description="راهنماها، یادداشت‌های سفر و علم پشت فنجانی که هر روز می‌نوشید."
        action={
          <Link
            href="/journal"
            className="text-sm font-semibold text-espresso-900 underline-offset-8 hover:underline"
          >
            همه مقاله‌ها
          </Link>
        }
      />

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {items.map((article, i) => (
          <Reveal key={article.slug} delay={i * 80}>
            <article className="group">
              <Link
                href={`/journal/${article.slug}`}
                className="relative block aspect-4/3 overflow-hidden rounded-2xl bg-cream-100"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </Link>
              <div className="mt-4 flex items-center gap-2 text-[0.7rem] text-ash-600">
                <span className="font-semibold text-accent-600">{article.category}</span>
                <span className="size-1 rounded-full bg-beige-300" aria-hidden="true" />
                <span>{formatReadingTime(article.readingTime)}</span>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-snug text-espresso-900">
                <Link href={`/journal/${article.slug}`} className="transition-colors hover:text-accent-600">
                  {article.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-2 text-sm/7 text-ash-600">{article.excerpt}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
