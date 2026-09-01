import Image from "next/image";
import { brewingGuides } from "@/data/site";
import { Tabs } from "@/components/ui/Disclosure";
import { SectionHeader } from "@/components/ui/Feedback";
import { ClockIcon, BeanIcon, FlameIcon, LeafIcon } from "@/components/ui/Icons";
import { toPersianDigits } from "@/lib/format";

const guideImages: Record<string, string> = {
  espresso: "/images/products/espresso-1.jpg",
  v60: "/images/products/v60-1.jpg",
  "french-press": "/images/products/frenchpress-1.jpg",
  aeropress: "/images/lifestyle/1.jpg",
};

/** Visual brewing guide — shared by the product page and the journal. */
export function BrewingGuide({ compact = false }: { compact?: boolean }) {
  return (
    <section className="bg-cream-100/60 py-16 lg:py-20" aria-labelledby="brewing-title">
      <div className="container-page">
        {!compact && (
          <SectionHeader
            eyebrow="راهنمای دم‌آوری"
            title="این قهوه را چطور دم کنیم؟"
            description="پارامترهای پیشنهادی تیم دربند برای چهار روش پرکاربرد."
          />
        )}
        {compact && (
          <h2 id="brewing-title" className="text-xl font-bold text-espresso-900">
            راهنمای دم‌آوری
          </h2>
        )}

        <Tabs
          className="mt-8"
          tabs={brewingGuides.map((guide) => ({
            id: guide.id,
            label: guide.title,
            content: (
              <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-cream-100">
                  <Image
                    src={guideImages[guide.id] ?? "/images/hero.jpg"}
                    alt={`دم‌آوری با ${guide.title}`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>

                <div>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: <ClockIcon className="size-4" />, label: "زمان", value: guide.time },
                      { icon: <BeanIcon className="size-4" />, label: "نسبت", value: guide.ratio },
                      { icon: <LeafIcon className="size-4" />, label: "آسیاب", value: guide.grind },
                      { icon: <FlameIcon className="size-4" />, label: "دما", value: guide.temperature },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-offwhite p-3.5">
                        <dt className="flex items-center gap-1.5 text-[0.68rem] text-ash-600">
                          <span className="text-accent-600">{item.icon}</span>
                          {item.label}
                        </dt>
                        <dd className="mt-1.5 text-sm font-bold text-espresso-900">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ol className="mt-6 space-y-4">
                    {guide.steps.map((step, i) => (
                      <li key={step} className="flex gap-3.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-espresso-900 text-xs font-bold text-cream-50">
                          {toPersianDigits(i + 1)}
                        </span>
                        <p className="pt-1 text-sm/7 text-ash-600">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ),
          }))}
        />
      </div>
    </section>
  );
}
