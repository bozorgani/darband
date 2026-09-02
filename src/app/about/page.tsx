import { absoluteUrl, sharedOpenGraph } from "@/config/site";
import type { Metadata } from "next";
import Image from "next/image";
import { brand, brandValues, aboutTimeline } from "@/data/site";
import { Breadcrumb } from "@/components/ui/Disclosure";
import { SectionHeader, StatBlock } from "@/components/ui/Feedback";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { toPersianDigits } from "@/lib/format";

export const metadata: Metadata = {
  title: "داستان قهوینو",
  description:
    "داستان رستری قهوینو: تهیه مستقیم دانه از مزارع، رست در تهران و شفافیت کامل درباره هر لات قهوه.",
  alternates: { canonical: "/about" },
  openGraph: {
    ...sharedOpenGraph,
    type: "website",
    url: absoluteUrl("/about"),
    title: "درباره قهوینو | رستری قهوه‌های تخصصی",
    description: "از یک رستر ۵ کیلویی در زیرزمین تا تأمین قهوه بیش از ۴۰ کافه.",
    images: ["/images/roastery.jpg"],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-espresso-950 text-cream-50 grain">
        <Image
          src="/images/roastery.jpg"
          alt="رست‌خانه قهوینو در حال کار"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/70 to-espresso-950/50" aria-hidden="true" />
        <div className="container-page relative z-10 py-20 lg:py-28">
          <Breadcrumb
            items={[{ label: "خانه", href: "/" }, { label: "درباره ما" }]}
            className="[&_a]:text-cream-100/60 [&_span]:text-cream-100"
          />
          <p className="eyebrow mt-6 text-accent-400">داستان ما</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.15] sm:text-5xl lg:text-6xl">
            داستان قهوینو، از دانه تا فنجان
          </h1>
          <p className="mt-5 max-w-2xl text-sm/8 text-cream-100/70 sm:text-base/9">
            {brand.name} با یک باور ساده شکل گرفت: قهوه خوب پنهان‌کاری نمی‌خواهد. اگر بدانید دانه
            از کجا آمده، چه کسی آن را چیده و چطور رست شده است، طعمش هم متفاوت می‌شود.
          </p>
          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-8 border-t border-cream-100/15 pt-8 sm:grid-cols-4">
            <StatBlock value={`+${toPersianDigits(40)}`} label="کافه همکار" tone="light" />
            <StatBlock value={`${toPersianDigits(9)}`} label="خاستگاه فعال" tone="light" />
            <StatBlock value={`+${toPersianDigits(9000)}`} label="مشتری خانگی" tone="light" />
            <StatBlock value={`${toPersianDigits(8)} سال`} label="سابقه رست" tone="light" />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="container-page py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <Reveal>
            <p className="eyebrow">فلسفه قهوه</p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
              قهوه محصول کشاورزی است، نه کالای صنعتی
            </h2>
            <div className="mt-5 space-y-4 text-sm/8 text-ash-600">
              <p>
                هر لات قهوه سال به سال تغییر می‌کند؛ بارش، ارتفاع، زمان برداشت و حتی سمت تپه‌ای که
                درخت روی آن روییده، طعم فنجان را جابه‌جا می‌کند. کار ما این نیست که این تفاوت‌ها را
                پنهان کنیم، بلکه این است که آن‌ها را برجسته کنیم.
              </p>
              <p>
                به همین دلیل پروفایل رست هر لات جداگانه طراحی می‌شود و پس از هر بار رست، نمونه‌ای
                در جلسه کاپینگ هفتگی ارزیابی می‌شود. اگر لاتی به استاندارد ما نرسد، اصلاً منتشر
                نمی‌شود.
              </p>
            </div>
            <ButtonLink href="/shop" size="lg" className="mt-8">
              دیدن لات‌های فعال
            </ButtonLink>
          </Reveal>

          <Reveal delay={120} className="grid grid-cols-2 gap-4">
            <div className="relative aspect-3/4 overflow-hidden rounded-3xl bg-cream-100">
              <Image
                src="/images/story.jpg"
                alt="برداشت گیلاس قهوه در مزرعه"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-10 aspect-3/4 overflow-hidden rounded-3xl bg-cream-100">
              <Image
                src="/images/lifestyle/3.jpg"
                alt="فضای کاپینگ و ارزیابی قهوه"
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="bg-cream-100/60 py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="فرآیند"
            title="از مزرعه تا فنجان، در چهار گام"
            description="هیچ مرحله‌ای را برون‌سپاری نمی‌کنیم؛ از انتخاب لات تا بسته‌بندی نهایی."
          />
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "انتخاب و کاپینگ",
                text: "نمونه‌های ارسالی از تعاونی‌ها را کور ارزیابی می‌کنیم و تنها لات‌های بالای ۸۴ امتیاز را می‌خریم.",
              },
              {
                title: "خرید مستقیم",
                text: "قرارداد مستقیم با مزرعه یا تعاونی، با قیمتی بالاتر از نرخ بورس و پرداخت پیش از برداشت.",
              },
              {
                title: "رست اختصاصی",
                text: "برای هر لات پروفایل جداگانه طراحی می‌شود و منحنی رست ثبت و بایگانی می‌گردد.",
              },
              {
                title: "بسته‌بندی و ارسال",
                text: "بسته‌بندی با دریچه یک‌طرفه و درج تاریخ رست روی هر بسته.",
              },
            ].map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 80}>
                  <span className="text-4xl font-black text-beige-300">
                    {toPersianDigits(`0${i + 1}`)}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-espresso-900">{step.title}</h3>
                  <p className="mt-2 text-sm/7 text-ash-600">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-20 lg:py-28">
        <SectionHeader eyebrow="ارزش‌ها" title="چیزهایی که سرشان مذاکره نمی‌کنیم" />
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {brandValues.map((value, i) => (
            <Reveal key={value.title} delay={i * 70}>
              <div className="border-t border-beige-300 pt-5">
                <h3 className="text-lg font-bold text-espresso-900">{value.title}</h3>
                <p className="mt-2 text-sm/7 text-ash-600">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-espresso-950 py-20 text-cream-50 grain lg:py-28">
        <div className="container-page">
          <SectionHeader eyebrow="مسیر ما" title="هشت سال، یک وسواس" tone="light" />
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {aboutTimeline.map((item, i) => (
              <li key={item.year}>
                <Reveal delay={i * 80}>
                  <div className="border-t border-cream-100/15 pt-5">
                    <span className="text-sm font-bold text-accent-400">{item.year}</span>
                    <h3 className="mt-2 text-lg font-bold text-cream-50">{item.title}</h3>
                    <p className="mt-2 text-sm/7 text-cream-100/65">{item.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 lg:py-24">
        <div className="grid gap-8 rounded-3xl bg-cream-100/70 p-8 text-center lg:p-14">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl leading-tight sm:text-4xl">بیایید فنجانی با هم بنوشیم</h2>
            <p className="mt-4 text-sm/8 text-ash-600">
              رست‌خانه ما هر پنجشنبه برای کاپینگ عمومی باز است. رزرو لازم نیست؛ فقط سر وقت
              بیایید.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/shop" size="lg">
                خرید قهوه
              </ButtonLink>
              <ButtonLink href="/journal" variant="outline" size="lg">
                خواندن ژورنال
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
