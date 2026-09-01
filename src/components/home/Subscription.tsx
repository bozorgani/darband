"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { CheckIcon, TruckIcon, RefreshIcon, ShieldIcon } from "@/components/ui/Icons";
import { useToast } from "@/store/toast";
import { testimonials } from "@/data/reviews";
import { Rating } from "@/components/ui/Primitives";
import { SectionHeader } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";

/* ------------------------------ Subscription ------------------------------ */

const plans = [
  {
    id: "discover",
    title: "کاوشگر",
    description: "هر ماه یک خاستگاه تازه، ۲۵۰ گرم",
    price: 420_000,
    perks: ["ارسال رایگان", "کارت معرفی لات", "امکان توقف در هر زمان"],
  },
  {
    id: "daily",
    title: "روزمره",
    description: "دو بسته ۲۵۰ گرمی از انتخاب خودتان",
    price: 760_000,
    perks: ["ارسال رایگان", "۱۰٪ تخفیف دائمی", "تغییر قهوه در هر دوره"],
    popular: true,
  },
  {
    id: "pro",
    title: "حرفه‌ای",
    description: "یک کیلوگرم، مناسب دفتر و کافه‌های کوچک",
    price: 1_380_000,
    perks: ["ارسال رایگان", "۱۵٪ تخفیف دائمی", "مشاوره دم‌آوری اختصاصی"],
  },
];

const frequencies = [
  { id: "monthly", label: "ماهانه" },
  { id: "biweekly", label: "هر دو هفته" },
];

export function Subscription() {
  const { toast } = useToast();
  const [plan, setPlan] = useState("daily");
  const [frequency, setFrequency] = useState("monthly");

  const active = plans.find((p) => p.id === plan)!;
  const price = frequency === "biweekly" ? Math.round(active.price * 1.85) : active.price;

  return (
    <section
      id="subscription"
      className="relative scroll-mt-24 overflow-hidden bg-espresso-900 py-20 text-cream-50 grain lg:py-28"
      aria-labelledby="subscription-title"
    >
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <Reveal>
          <p className="eyebrow text-accent-400">اشتراک قهوه</p>
          <h2 id="subscription-title" className="mt-3 text-3xl leading-tight sm:text-4xl">
            قهوه‌ی مورد علاقه‌ات را هر ماه درب منزل تحویل بگیر
          </h2>
          <p className="mt-4 max-w-lg text-sm/8 text-cream-100/70">
            دیگر نگران تمام شدن قهوه نباشید. ما تازه‌ترین رست هفته را در روزی که انتخاب می‌کنید
            برایتان می‌فرستیم — با امکان توقف، تغییر یا لغو در هر لحظه.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: <TruckIcon className="size-4" />, text: "ارسال رایگان برای تمام دوره‌ها" },
              { icon: <RefreshIcon className="size-4" />, text: "تغییر قهوه یا تاریخ ارسال در هر دوره" },
              { icon: <ShieldIcon className="size-4" />, text: "بدون قرارداد و بدون جریمه لغو" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm text-cream-100/80">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream-100/10 text-accent-400">
                  {item.icon}
                </span>
                {item.text}
              </li>
            ))}
          </ul>

          <div className="relative mt-10 hidden aspect-16/9 overflow-hidden rounded-3xl lg:block">
            <Image
              src="/images/lifestyle/2.jpg"
              alt="بسته اشتراک ماهانه قهوه دربند"
              fill
              loading="lazy"
              sizes="50vw"
              className="object-cover opacity-85"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-cream-100/12 bg-cream-100/5 p-6 backdrop-blur-sm sm:p-8">
            {/* Frequency */}
            <div
              role="radiogroup"
              aria-label="دوره ارسال"
              className="mb-6 inline-flex rounded-full border border-cream-100/15 p-1"
            >
              {frequencies.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={frequency === f.id}
                  onClick={() => setFrequency(f.id)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold transition",
                    frequency === f.id
                      ? "bg-cream-50 text-espresso-900"
                      : "text-cream-100/65 hover:text-cream-50",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div role="radiogroup" aria-label="پلن اشتراک" className="space-y-3">
              {plans.map((p) => {
                const selected = plan === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPlan(p.id)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl border p-4 text-start transition-all duration-300",
                      selected
                        ? "border-accent-500 bg-accent-600/12"
                        : "border-cream-100/12 hover:border-cream-100/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition",
                        selected ? "border-accent-400 bg-accent-500 text-white" : "border-cream-100/30",
                      )}
                    >
                      {selected && <CheckIcon className="size-3" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-cream-50">{p.title}</span>
                        {p.popular && (
                          <span className="rounded-full bg-accent-600 px-2 py-0.5 text-[0.6rem] font-bold text-white">
                            محبوب‌ترین
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-xs text-cream-100/60">{p.description}</span>
                      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                        {p.perks.map((perk) => (
                          <li key={perk} className="text-[0.68rem] text-cream-100/55">
                            • {perk}
                          </li>
                        ))}
                      </ul>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-end justify-between border-t border-cream-100/12 pt-5">
              <div>
                <p className="text-[0.7rem] text-cream-100/55">
                  پرداخت {frequency === "monthly" ? "ماهانه" : "هر دو هفته"}
                </p>
                <p className="mt-1 text-2xl font-black text-cream-50">
                  {toPersianDigits(price.toLocaleString("en-US"))}
                  <span className="ms-1 text-xs font-medium text-cream-100/60">تومان</span>
                </p>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  // TODO(backend): subscriptions need a real recurring-billing API.
                  toast({
                    tone: "success",
                    title: "اشتراک شما رزرو شد",
                    description: `پلن ${active.title} — ${formatPrice(price)} به‌صورت ${
                      frequency === "monthly" ? "ماهانه" : "دوهفته‌ای"
                    }`,
                  })
                }
              >
                شروع اشتراک
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

export function Testimonials() {
  const [index, setIndex] = useState(0);

  return (
    <section className="container-page py-20 lg:py-28" aria-labelledby="testimonials-title">
      <SectionHeader
        eyebrow="نظر مشتریان"
        title="آنچه درباره ما می‌گویند"
        align="center"
      />

      <div className="mx-auto mt-12 max-w-3xl">
        <blockquote className="text-center">
          <Rating value={testimonials[index].rating} showValue={false} size="md" className="justify-center" />
          <p className="mt-6 text-lg/9 font-medium text-espresso-900 sm:text-2xl/[2.6rem]">
            «{testimonials[index].quote}»
          </p>
          <footer className="mt-6">
            <p className="text-sm font-bold text-espresso-900">{testimonials[index].author}</p>
            <p className="mt-1 text-xs text-ash-600">{testimonials[index].role}</p>
          </footer>
        </blockquote>

        <div className="mt-9 flex items-center justify-center gap-2" role="tablist" aria-label="نظرات مشتریان">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`نظر ${t.author}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-8 bg-espresso-900" : "w-3 bg-beige-300 hover:bg-ash-400",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
