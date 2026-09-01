"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { toEnglishDigits, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { isValidIranMobile } from "./auth.utils";

const INVALID_MESSAGE = "شماره موبایل واردشده معتبر نیست.";
const PHONE_LENGTH = 11;

/** Keeps only digits (Persian/Arabic included) and never exceeds 11 characters. */
function sanitizePhone(raw: string): string {
  return toEnglishDigits(raw)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "")
    .slice(0, PHONE_LENGTH);
}

/**
 * Step 1 of the unified sign-in / sign-up flow: the phone number.
 * Login and registration share one entry point — the mock service decides
 * afterwards whether the profile step is needed.
 */
export function PhoneForm({ next }: { next?: string }) {
  const router = useRouter();
  const { sendCode, status, error, clearError } = useAuth();
  const [value, setValue] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = status === "sending" || status === "validating";
  const message = localError ?? (error?.code === "invalid-phone" ? error.message : null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return; // guards double submits

    if (!isValidIranMobile(value)) {
      setLocalError(INVALID_MESSAGE);
      inputRef.current?.focus();
      return;
    }

    setLocalError(null);
    const ok = await sendCode(value);
    if (ok) {
      const query = next ? `?next=${encodeURIComponent(next)}` : "";
      router.push(`/auth/verify${query}`);
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-espresso-900">
        شماره موبایل
      </label>

      <div
        className={cn(
          "flex h-13 items-center rounded-full border bg-white/80 px-5 transition-colors duration-200",
          message ? "border-danger" : "border-espresso-900/15 focus-within:border-accent-600",
        )}
      >
        <input
          ref={inputRef}
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          data-testid="phone-input"
          placeholder="09123456789"
          maxLength={PHONE_LENGTH}
          pattern="09[0-9]{9}"
          value={value}
          aria-invalid={Boolean(message)}
          aria-describedby={message ? "phone-error" : "phone-hint"}
          onChange={(e) => {
            setValue(sanitizePhone(e.target.value));
            if (localError) setLocalError(null);
            if (error) clearError();
          }}
          className="h-full flex-1 bg-transparent text-start text-base tracking-wide text-espresso-900 placeholder:text-ash-400 focus:outline-none"
        />
      </div>

      <p
        id="phone-error"
        role="alert"
        aria-live="assertive"
        className={cn(
          "mt-2 min-h-5 text-xs font-medium text-danger transition-opacity",
          message ? "opacity-100" : "opacity-0",
        )}
      >
        {message}
      </p>

      <p id="phone-hint" className="text-[0.7rem] text-ash-600">
        شماره را {toPersianDigits(11)} رقمی و با {toPersianDigits("09")} وارد کنید؛ کد تأیید{" "}
        {toPersianDigits(5)} رقمی برای همین شماره پیامک می‌شود.
      </p>

      <Button
        type="submit"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={busy}
        data-testid="send-code"
      >
        {busy ? "در حال ارسال کد…" : "ارسال کد تأیید"}
        {!busy && <ArrowLeftIcon className="size-4 rtl:rotate-180" />}
      </Button>
    </form>
  );
}
