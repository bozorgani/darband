"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { finderQuestions } from "@/data/site";
import { products } from "@/data/products";
import { recommendCoffee, type FinderAnswers } from "@/lib/finder";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { ArrowLeftIcon, CheckIcon, RefreshIcon, SparkIcon } from "@/components/ui/Icons";
import { useStore } from "@/store/store";
import { Skeleton } from "@/components/ui/Primitives";

/**
 * Interactive coffee finder — five questions, scored locally.
 * TODO(backend): could later be a `POST /api/recommendations` call.
 */
export function CoffeeFinder() {
  const { addProduct } = useStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FinderAnswers>({});
  const [computing, setComputing] = useState(false);

  const total = finderQuestions.length;
  const finished = step >= total;
  const question = finderQuestions[step];

  const matches = useMemo(
    () => (finished ? recommendCoffee(products, answers, 3) : []),
    [finished, answers],
  );

  function choose(id: string) {
    const next = { ...answers, [question.id]: id };
    setAnswers(next);
    if (step === total - 1) {
      setComputing(true);
      window.setTimeout(() => {
        setComputing(false);
        setStep(step + 1);
      }, 650);
    } else {
      setStep(step + 1);
    }
  }

  function reset() {
    setAnswers({});
    setStep(0);
  }

  const progress = Math.round((Math.min(step, total) / total) * 100);

  return (
    <section
      id="coffee-finder"
      className="scroll-mt-24 bg-cream-100/60 py-20 lg:py-28"
      aria-labelledby="finder-title"
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">راهنمای انتخاب</p>
          <h2 id="finder-title" className="mt-3 text-3xl leading-tight sm:text-4xl">
            قهوه‌ی مناسب خودت را پیدا کن
          </h2>
          <p className="mt-3 text-sm/7 text-ash-600 sm:text-base/8">
            پنج سؤال کوتاه، و ما از میان لات‌های فعال، مناسب‌ترین‌ها را برای ذائقه شما انتخاب
            می‌کنیم.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-beige-300/70 bg-offwhite shadow-[0_30px_70px_-40px_rgba(34,21,14,0.4)]">
          {/* Progress */}
          <div className="flex items-center gap-4 border-b border-beige-300/70 px-6 py-4">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-beige-200"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="پیشرفت پرسش‌نامه"
            >
              <div
                className="h-full rounded-full bg-accent-600 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-ash-600">
              {finished
                ? "نتیجه"
                : `گام ${toPersianDigits(step + 1)} از ${toPersianDigits(total)}`}
            </span>
          </div>

          <div className="p-6 sm:p-9">
            {computing ? (
              <div className="space-y-5" aria-live="polite">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-espresso-900">
                  <SparkIcon className="size-4 animate-spin text-accent-600" />
                  در حال یافتن بهترین گزینه‌ها…
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl" />
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ) : !finished ? (
              <div key={question.id} className="animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-espresso-900 sm:text-2xl">
                      {question.question}
                    </h3>
                    <p className="mt-2 text-xs/6 text-ash-600">{question.hint}</p>
                  </div>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-espresso-900/15 px-3 py-1.5 text-xs font-semibold text-espresso-800 transition hover:border-espresso-900"
                    >
                      <ArrowLeftIcon className="size-3.5 rotate-180" />
                      قبلی
                    </button>
                  )}
                </div>

                <div
                  role="radiogroup"
                  aria-label={question.question}
                  className="mt-7 grid gap-3 sm:grid-cols-2"
                >
                  {question.options.map((option) => {
                    const selected = answers[question.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => choose(option.id)}
                        className={cn(
                          "group flex items-center justify-between gap-4 rounded-2xl border p-4 text-start transition-all duration-300",
                          selected
                            ? "border-espresso-900 bg-espresso-900 text-cream-50"
                            : "border-beige-300 bg-cream-50/40 hover:border-espresso-900/40 hover:bg-cream-50",
                        )}
                      >
                        <span>
                          <span className="block text-sm font-bold">{option.label}</span>
                          <span
                            className={cn(
                              "mt-1 block text-xs",
                              selected ? "text-cream-100/70" : "text-ash-600",
                            )}
                          >
                            {option.description}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-full border transition",
                            selected
                              ? "border-cream-50 bg-cream-50 text-espresso-900"
                              : "border-espresso-900/20 text-transparent group-hover:border-espresso-900/45",
                          )}
                        >
                          <CheckIcon className="size-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-espresso-900 sm:text-2xl">
                      سه پیشنهاد برای ذائقه شما
                    </h3>
                    <p className="mt-1.5 text-xs text-ash-600">
                      بر اساس پاسخ‌های شما از میان {toPersianDigits(products.length)} محصول انتخاب شد.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full border border-espresso-900/15 px-4 py-2 text-xs font-semibold text-espresso-800 transition hover:border-espresso-900"
                  >
                    <RefreshIcon className="size-3.5" />
                    شروع دوباره
                  </button>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-3">
                  {matches.map(({ product, match, reasons }, i) => (
                    <article
                      key={product.id}
                      className="group flex flex-col rounded-2xl border border-beige-300/70 bg-cream-50/40 p-3 transition hover:border-espresso-900/25 hover:shadow-lg"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        className="relative aspect-square overflow-hidden rounded-xl bg-cream-100"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 100vw, 240px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <span className="absolute end-2 top-2 rounded-full bg-espresso-900/90 px-2 py-1 text-[0.65rem] font-bold text-cream-50">
                          {toPersianDigits(match)}٪ تطابق
                        </span>
                      </Link>
                      <h4 className="mt-3 text-sm font-bold text-espresso-900">
                        <Link href={`/product/${product.slug}`} className="hover:text-accent-600">
                          {product.title}
                        </Link>
                      </h4>
                      <ul className="mt-2 flex-1 space-y-1">
                        {reasons.map((r) => (
                          <li key={r} className="flex items-start gap-1.5 text-[0.7rem] text-ash-600">
                            <CheckIcon className="mt-0.5 size-3 shrink-0 text-success" />
                            {r}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm font-bold text-espresso-900">
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        size="sm"
                        className="mt-3"
                        fullWidth
                        onClick={() => addProduct(product)}
                        disabled={!product.inStock}
                      >
                        افزودن به سبد
                      </Button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
