import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { brand } from "@/data/site";
import { BeanIcon, LeafIcon, TruckIcon, ArrowUpLeftIcon } from "@/components/ui/Icons";
import { toPersianDigits } from "@/lib/format";

export function Hero() {
  return (
    <section className="relative isolate min-h-[92svh] overflow-hidden bg-espresso-950 text-cream-50 grain lg:min-h-[100svh]">
      {/* Background */}
      <Image
        src="/images/hero.jpg"
        alt="دم‌آوری اسپرسو تازه در رست‌خانه دربند"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/70 to-espresso-950/35"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-l from-espresso-950/85 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container-page relative z-10 flex min-h-[92svh] flex-col justify-end pb-12 pt-32 lg:min-h-[100svh] lg:pb-16">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cream-100/25 bg-cream-100/8 px-3.5 py-1.5 text-[0.7rem] font-medium backdrop-blur-sm animate-fade-in">
            <span className="size-1.5 rounded-full bg-accent-400" aria-hidden="true" />
            برداشت تازه ۲۰۲۵ اتیوپی رسید
          </span>

          <h1 className="mt-6 text-[2.6rem] font-black leading-[1.1] tracking-tight animate-fade-up sm:text-6xl lg:text-[4.5rem]">
            هر فنجان،
            <br />
            <span className="text-accent-400">روایتِ یک دانه</span>
          </h1>

          <p
            className="mt-5 max-w-xl text-sm/8 text-cream-100/75 animate-fade-up sm:text-base/9"
            style={{ animationDelay: "120ms" }}
          >
            {brand.name} دانه‌ها را مستقیم از مزارع منتخب آفریقا و آمریکای لاتین تهیه می‌کند،
            در تهران رست می‌کند و کمتر از ۴۸ ساعت بعد به دست شما می‌رساند.
          </p>

          <div
            className="mt-8 flex flex-col gap-3 animate-fade-up sm:flex-row sm:items-center"
            style={{ animationDelay: "220ms" }}
          >
            <ButtonLink href="/shop" variant="light" size="lg">
              خرید از فروشگاه
              <ArrowUpLeftIcon className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/#coffee-finder"
              size="lg"
              className="border border-cream-100/30 bg-transparent text-cream-50 shadow-none hover:bg-cream-100/10"
            >
              قهوه‌ات را پیدا کن
            </ButtonLink>
          </div>

          <dl
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-cream-100/15 pt-6 animate-fade-up"
            style={{ animationDelay: "320ms" }}
          >
            {[
              { value: `+${toPersianDigits(40)}`, label: "کافه همکار" },
              { value: `${toPersianDigits(9)} خاستگاه`, label: "لات فعال فصل" },
              { value: `${toPersianDigits(48)} ساعت`, label: "از رست تا ارسال" },
            ].map((item) => (
              <div key={item.label}>
                <dt className="sr-only">{item.label}</dt>
                <dd>
                  <span className="block text-lg font-bold sm:text-xl">{item.value}</span>
                  <span className="mt-1 block text-[0.7rem] text-cream-100/55">{item.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Slim trust strip that sits directly under the hero. */
export function TrustStrip() {
  const items = [
    { icon: <BeanIcon className="size-5" />, title: "رست در روز سفارش", text: "تاریخ رست روی هر بسته" },
    { icon: <TruckIcon className="size-5" />, title: "ارسال رایگان", text: "برای سفارش‌های بالای ۱٬۵۰۰٬۰۰۰ تومان" },
    { icon: <LeafIcon className="size-5" />, title: "تهیه مستقیم", text: "بدون واسطه، از مزرعه تا فنجان" },
  ];

  return (
    <section aria-label="مزیت‌های خرید از دربند" className="border-b border-beige-300/60 bg-cream-50">
      <div className="container-page grid gap-6 py-7 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-espresso-900/6 text-accent-600">
              {item.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-espresso-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-ash-600">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
