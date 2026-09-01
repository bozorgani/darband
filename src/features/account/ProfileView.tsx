"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Overlay";
import { CheckIcon, LockIcon, PhoneIcon, TrashIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { useToast } from "@/store/toast";
import { useAuth } from "@/features/auth/AuthProvider";
import { formatPhoneForDisplay, isValidEmail, isValidIranMobile } from "@/features/auth/auth.utils";
import {
  confirmPhoneChange,
  requestPhoneChange,
  requestAccountDeletion,
  OTP_LENGTH,
} from "@/features/auth/auth.service";
import { AccountPageHeader } from "./AccountShell";

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function ProfileView() {
  const { user, saveProfile, applyUser, signOut } = useAuth();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [gender, setGender] = useState(user?.gender ?? "unspecified");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [phoneModal, setPhoneModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextErrors: Errors = {};
    if (firstName.trim().length < 2) nextErrors.firstName = "نام را وارد کنید.";
    if (lastName.trim().length < 2) nextErrors.lastName = "نام خانوادگی را وارد کنید.";
    if (!isValidEmail(email)) nextErrors.email = "ایمیل واردشده معتبر نیست.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      if (nextErrors.firstName) firstRef.current?.focus();
      else if (nextErrors.lastName) lastRef.current?.focus();
      else emailRef.current?.focus();
      return;
    }

    setSaving(true);
    const ok = await saveProfile({
      firstName,
      lastName,
      email: email.trim() || undefined,
      birthDate: birthDate.trim() || undefined,
      gender: gender as "female" | "male" | "unspecified",
    });
    setSaving(false);

    toast(
      ok
        ? { tone: "success", title: "تغییرات ذخیره شد" }
        : { tone: "danger", title: "ذخیره تغییرات ناموفق بود", description: "دوباره تلاش کنید." },
    );
  }

  return (
    <>
      <AccountPageHeader
        title="اطلاعات حساب"
        description="این اطلاعات روی فاکتور و ارسال سفارش‌های شما استفاده می‌شود."
        breadcrumb={[{ label: "اطلاعات حساب" }]}
      />

      <form
        onSubmit={onSubmit}
        noValidate
        data-testid="profile-settings"
        className="rounded-3xl border border-beige-300/70 bg-white/70 p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            ref={firstRef}
            label="نام"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            error={errors.firstName}
            data-testid="profile-first-name"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            ref={lastRef}
            label="نام خانوادگی"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            error={errors.lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* Phone — verified, changed through its own OTP flow */}
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-semibold text-espresso-800">
            شماره موبایل
          </span>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3">
            <LockIcon className="size-4 text-ash-600" />
            <span className="latin text-sm font-bold text-espresso-900" data-testid="profile-phone">
              {formatPhoneForDisplay(user.phone)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[0.65rem] font-semibold text-success">
              <CheckIcon className="size-3" />
              تأییدشده
            </span>
            <button
              type="button"
              onClick={() => setPhoneModal(true)}
              className="ms-auto text-xs font-semibold text-accent-600 underline underline-offset-4 hover:text-accent-500"
            >
              تغییر شماره
            </button>
          </div>
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
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <fieldset className="mt-5">
          <legend className="mb-2 text-xs font-semibold text-espresso-800">جنسیت (اختیاری)</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "unspecified", label: "ترجیح می‌دهم نگویم" },
              { id: "female", label: "زن" },
              { id: "male", label: "مرد" },
            ].map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex h-10 cursor-pointer items-center rounded-full border px-4 text-xs font-semibold transition-colors",
                  gender === option.id
                    ? "border-espresso-900 bg-espresso-900 text-cream-50"
                    : "border-espresso-900/15 text-espresso-800 hover:border-espresso-900/35",
                )}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.id}
                  checked={gender === option.id}
                  onChange={() => setGender(option.id as typeof gender)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving} data-testid="save-profile">
            {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </Button>
          <p className="text-[0.7rem] text-ash-600">
            عضو دربند از {user.createdAt}
          </p>
        </div>
      </form>

      {/* Danger zone */}
      <section className="mt-6 rounded-3xl border border-danger/25 bg-danger/[0.04] p-5">
        <h2 className="text-sm font-bold text-danger">حذف حساب کاربری</h2>
        <p className="mt-2 max-w-xl text-xs/6 text-ash-600">
          با حذف حساب، دسترسی شما به تاریخچه سفارش‌ها از بین می‌رود. در این نسخه نمایشی، فقط نشست
          محلی مرورگر پاک می‌شود.
        </p>
        <Button variant="danger" size="sm" className="mt-4" onClick={() => setDeleteModal(true)}>
          <TrashIcon className="size-4" />
          درخواست حذف حساب
        </Button>
      </section>

      {phoneModal && (
        <PhoneChangeModal
          onClose={() => setPhoneModal(false)}
          onDone={(next) => {
            applyUser(next);
            setPhoneModal(false);
            toast({ tone: "success", title: "شماره موبایل به‌روزرسانی شد" });
          }}
        />
      )}

      {deleteModal && (
        <DeleteAccountModal
          onClose={() => setDeleteModal(false)}
          onConfirm={async () => {
            await requestAccountDeletion();
            signOut();
            toast({
              tone: "info",
              title: "درخواست حذف حساب ثبت شد",
              description: "در این نسخه نمایشی فقط نشست محلی پاک شد.",
            });
          }}
        />
      )}
    </>
  );
}

/* --------------------------- Change phone number -------------------------- */

function PhoneChangeModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (user: NonNullable<ReturnType<typeof useAuth>["user"]>) => void;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitPhone() {
    if (busy) return;
    if (!isValidIranMobile(phone)) {
      setError("شماره موبایل واردشده معتبر نیست.");
      return;
    }
    setBusy(true);
    setError(null);
    const result = await requestPhoneChange(phone);
    setBusy(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setStep("code");
  }

  async function submitCode() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await confirmPhoneChange(phone, code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    onDone(result.data);
  }

  return (
    <Modal open onClose={onClose} title="تغییر شماره موبایل">
      <p className="text-sm/7 text-ash-600">
        {step === "phone"
          ? "شماره جدید را وارد کنید؛ یک کد تأیید برای آن ارسال می‌شود."
          : `کد ${toPersianDigits(OTP_LENGTH)} رقمی ارسال‌شده به شماره جدید را وارد کنید.`}
      </p>

      <div className="mt-5">
        {step === "phone" ? (
          <Input
            label="شماره موبایل جدید"
            name="new-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder="09123456789"
            maxLength={11}
            value={phone}
            error={error ?? undefined}
            hint="۱۱ رقم، با ۰۹ شروع شود."
            onChange={(e) => {
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 11));
              setError(null);
            }}
          />
        ) : (
          <Input
            label="کد تأیید"
            name="phone-otp"
            inputMode="numeric"
            dir="ltr"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            value={code}
            error={error ?? undefined}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
          />
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <Button
          fullWidth
          disabled={busy}
          onClick={() => (step === "phone" ? void submitPhone() : void submitCode())}
        >
          <PhoneIcon className="size-4" />
          {busy ? "لطفاً صبر کنید…" : step === "phone" ? "ارسال کد تأیید" : "تأیید شماره جدید"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          انصراف
        </Button>
      </div>

      <p className="mt-4 text-[0.7rem] text-ash-400">
        این جریان نمایشی است و به سرویس پیامک واقعی متصل نیست.
      </p>
    </Modal>
  );
}

/* ----------------------------- Delete account ----------------------------- */

function DeleteAccountModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Modal open onClose={onClose} title="حذف حساب کاربری">
      <p className="text-sm/7 text-ash-600">
        آیا از حذف حساب مطمئن هستید؟ در نسخه واقعی، این درخواست برای تیم پشتیبانی ارسال می‌شود و
        اطلاعات پس از تأیید حذف می‌گردد.
      </p>
      <div className="mt-6 flex gap-2">
        <Button
          variant="danger"
          fullWidth
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
            router.replace("/");
          }}
        >
          {busy ? "در حال ثبت درخواست…" : "بله، حساب حذف شود"}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          انصراف
        </Button>
      </div>
    </Modal>
  );
}
