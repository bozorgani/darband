"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import { useToast } from "@/store/toast";
import { useAuth } from "./AuthProvider";
import { isValidEmail } from "./auth.utils";

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  terms?: string;
}

/** Step 3 — shown only for phone numbers with no existing account. */
export function CompleteProfileForm({ next }: { next?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { saveProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors: Errors = {};
    if (firstName.trim().length < 2) nextErrors.firstName = "نام را وارد کنید.";
    if (lastName.trim().length < 2) nextErrors.lastName = "نام خانوادگی را وارد کنید.";
    if (!isValidEmail(email)) nextErrors.email = "ایمیل واردشده معتبر نیست.";
    if (!terms) nextErrors.terms = "برای ادامه، پذیرش قوانین الزامی است.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      /* Focus the first invalid field. */
      if (nextErrors.firstName) firstRef.current?.focus();
      else if (nextErrors.lastName) lastRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else termsRef.current?.focus();
      return;
    }

    setSaving(true);
    const ok = await saveProfile({
      firstName,
      lastName,
      email: email.trim() || undefined,
      birthDate: birthDate.trim() || undefined,
      acceptedTerms: true,
      newsletter,
    });
    setSaving(false);

    if (!ok) {
      toast({ tone: "danger", title: "ذخیره اطلاعات ناموفق بود", description: "دوباره تلاش کنید." });
      return;
    }

    toast({
      tone: "success",
      title: `${firstName} عزیز، خوش آمدید`,
      description: "حساب کاربری شما ساخته شد.",
    });
    router.replace(next && next.startsWith("/") ? next : "/account");
  }

  return (
    <form onSubmit={onSubmit} noValidate data-testid="profile-form">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          ref={firstRef}
          label="نام"
          name="firstName"
          autoComplete="given-name"
          value={firstName}
          error={errors.firstName}
          data-testid="first-name"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          ref={lastRef}
          label="نام خانوادگی"
          name="lastName"
          autoComplete="family-name"
          value={lastName}
          error={errors.lastName}
          data-testid="last-name"
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          ref={emailRef}
          label="ایمیل (اختیاری)"
          name="email"
          type="email"
          dir="ltr"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="تاریخ تولد (اختیاری)"
          name="birthDate"
          placeholder="۱۳۷۰/۰۵/۱۲"
          hint="برای هدیه تولد استفاده می‌شود."
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-espresso-800">
          <input
            ref={termsRef}
            type="checkbox"
            checked={terms}
            aria-invalid={Boolean(errors.terms)}
            data-testid="accept-terms"
            onChange={(e) => {
              setTerms(e.target.checked);
              if (e.target.checked) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            className={cn(
              "mt-0.5 size-[18px] shrink-0 rounded-[6px] accent-espresso-900",
              errors.terms && "outline outline-2 outline-danger",
            )}
          />
          <span>قوانین و مقررات و سیاست حریم خصوصی دربند را می‌پذیرم.</span>
        </label>
        {errors.terms && (
          <p role="alert" className="text-xs font-medium text-danger">
            {errors.terms}
          </p>
        )}

        <label className="flex cursor-pointer items-start gap-3 text-sm text-espresso-800">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 size-[18px] shrink-0 rounded-[6px] accent-espresso-900"
          />
          <span>خبرنامه دربند و پیشنهادهای ویژه برایم ارسال شود.</span>
        </label>
      </div>

      <Button type="submit" size="lg" fullWidth className="mt-7" disabled={saving} data-testid="submit-profile">
        {saving ? "در حال ساخت حساب…" : "تکمیل ثبت‌نام و ورود"}
      </Button>
    </form>
  );
}
