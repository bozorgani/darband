"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { brand, footerNav, hasContactInfo, legalLinks, socialLinks } from "@/data/site";
import { socialIcons, MailIcon, PhoneIcon, PinIcon, ClockIcon, CheckIcon } from "@/components/ui/Icons";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/store/toast";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-espresso-950 text-cream-100 grain">
      <div className="container-page relative z-10 py-16 lg:py-20">
        {/* Newsletter */}
        <div className="grid gap-10 border-b border-cream-100/12 pb-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow text-accent-400">خبرنامه قهوینو</p>
            <h2 className="mt-3 text-2xl leading-snug text-cream-50 sm:text-3xl">
              هر جمعه، یک نامه کوتاه درباره قهوه
            </h2>
            <p className="mt-3 max-w-lg text-sm/7 text-cream-100/65">
              لات‌های تازه، دستورهای دم‌آوری و یادداشت‌های سفر خاستگاه. بدون تبلیغات، هر زمان
              خواستید لغو کنید.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Links */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo className="h-9 text-cream-50" />
            <p className="mt-5 max-w-xs text-sm/7 text-cream-100/60">{brand.description}</p>
            {hasContactInfo ? (
              <ul className="mt-6 space-y-2.5 text-sm text-cream-100/70">
                {brand.address && (
                  <li className="flex items-start gap-2.5">
                    <PinIcon className="mt-0.5 size-4 shrink-0 text-accent-400" />
                    {brand.address}
                  </li>
                )}
                {brand.phone && brand.phoneHref && (
                  <li className="flex items-center gap-2.5">
                    <PhoneIcon className="size-4 shrink-0 text-accent-400" />
                    <a href={`tel:${brand.phoneHref}`} className="transition hover:text-cream-50">
                      {brand.phone}
                    </a>
                  </li>
                )}
                {brand.email && (
                  <li className="flex items-center gap-2.5">
                    <MailIcon className="size-4 shrink-0 text-accent-400" />
                    <a
                      href={`mailto:${brand.email}`}
                      className="latin transition hover:text-cream-50"
                    >
                      {brand.email}
                    </a>
                  </li>
                )}
                {brand.hours && (
                  <li className="flex items-center gap-2.5">
                    <ClockIcon className="size-4 shrink-0 text-accent-400" />
                    {brand.hours}
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-6 text-sm/7 text-cream-100/50">
                راه‌های ارتباطی قهوینو به‌زودی از همین‌جا در دسترس قرار می‌گیرد.
              </p>
            )}
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-sm font-bold text-cream-50">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream-100/60 transition-colors duration-200 hover:text-accent-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col-reverse gap-6 border-t border-cream-100/12 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-xs text-cream-100/45">
              © {brand.name} — تمام حقوق محفوظ است.
            </p>
            <ul className="flex flex-wrap gap-4">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-cream-100/45 transition hover:text-cream-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            {/* Empty until the official Ghahvino accounts are confirmed. */}
            {socialLinks.map((s) => {
              const Icon = socialIcons[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-10 items-center justify-center rounded-full border border-cream-100/15 text-cream-100/70 transition hover:border-accent-500 hover:bg-accent-600 hover:text-white"
                >
                  <Icon className="size-[18px]" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return;
    }
    setError(null);
    setState("loading");
    // TODO(backend): POST /api/newsletter — currently mocked.
    window.setTimeout(() => {
      setState("done");
      toast({
        tone: "success",
        title: "عضویت شما ثبت شد",
        description: "اولین نامه جمعه این هفته می‌رسد.",
      });
    }, 700);
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-accent-500/40 bg-accent-600/10 px-5 py-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
          <CheckIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-cream-50">به جمع ما خوش آمدید</p>
          <p className="mt-0.5 text-xs text-cream-100/60">
            نامه خوش‌آمدگویی به‌همراه کد تخفیف برای شما ارسال شد.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <label htmlFor="newsletter-email" className="mb-2 block text-xs font-semibold text-cream-100/70">
        نشانی ایمیل
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="h-12 flex-1 rounded-full border border-cream-100/20 bg-cream-100/5 px-5 text-sm text-cream-50 placeholder:text-cream-100/35 transition focus:border-accent-500 focus:outline-none"
        />
        <Button type="submit" variant="secondary" size="lg" disabled={state === "loading"}>
          {state === "loading" ? "در حال ثبت…" : "عضویت"}
        </Button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-2 text-xs font-medium text-accent-400">
          {error}
        </p>
      )}
    </form>
  );
}
