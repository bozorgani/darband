"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useToast } from "@/store/toast";
import { useAuth } from "./AuthProvider";
import { OTP_LENGTH, OTP_RESEND_SECONDS, OTP_TTL_SECONDS } from "./auth.service";
import { maskPhone, normalizeDigits } from "./auth.utils";
import { getSafeRedirectPath } from "./redirect";

const EMPTY = Array.from({ length: OTP_LENGTH }, () => "");

/** Step 2 — one-time code entry. */
export function OtpForm({ next }: { next?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { pendingPhone, challenge, status, error, verifyCode, resendCode, resetFlow } = useAuth();

  const [digits, setDigits] = useState<string[]>(EMPTY);
  const [now, setNow] = useState(() => Date.now());
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const submitting = useRef(false);

  /* One shared 1s tick drives both countdowns. */
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const requestedAt = challenge ? challenge.expiresAt - OTP_TTL_SECONDS * 1000 : 0;
  const resendAt = requestedAt + OTP_RESEND_SECONDS * 1000;
  const resendIn = challenge ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0;
  const expiresIn = challenge ? Math.max(0, Math.ceil((challenge.expiresAt - now) / 1000)) : 0;

  const expired = status === "expired" || (Boolean(challenge) && expiresIn === 0);
  const verifying = status === "verifying";
  const sending = status === "sending";
  const code = digits.join("");
  const complete = code.length === OTP_LENGTH;

  const focusBox = (index: number) => inputs.current[index]?.focus();

  const submit = useCallback(
    async (value: string) => {
      if (submitting.current || value.length !== OTP_LENGTH) return;
      submitting.current = true;
      const result = await verifyCode(value);
      submitting.current = false;

      if (!result.ok) {
        setDigits(EMPTY);
        focusBox(0);
        return;
      }

      /* New accounts stay on this route: `VerifyEntry` derives the profile
         step from the session, so a refresh cannot lose it. */
      if (result.isNewUser) return;

      toast({ tone: "success", title: "خوش آمدید", description: "با موفقیت وارد حساب خود شدید." });
      router.replace(getSafeRedirectPath(next));
    },
    [next, router, toast, verifyCode],
  );

  /* State updaters stay pure: the next value is computed first, side effects
     (focus move, auto-submit) happen after the state call. */
  const setDigit = (index: number, raw: string) => {
    const value = normalizeDigits(raw).slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = value;
    setDigits(nextDigits);

    if (value && index < OTP_LENGTH - 1) focusBox(index + 1);
    const joined = nextDigits.join("");
    if (joined.length === OTP_LENGTH) void submit(joined);
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextDigits = [...digits];
      if (nextDigits[index]) {
        nextDigits[index] = "";
      } else if (index > 0) {
        nextDigits[index - 1] = "";
        focusBox(index - 1);
      }
      setDigits(nextDigits);
    }
    if (event.key === "ArrowLeft" && index < OTP_LENGTH - 1) focusBox(index + 1);
    if (event.key === "ArrowRight" && index > 0) focusBox(index - 1);
    if (event.key === "Enter" && complete) void submit(code);
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = normalizeDigits(event.clipboardData.getData("text")).slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const nextDigits = [...EMPTY];
    pasted.split("").forEach((d, i) => {
      nextDigits[i] = d;
    });
    setDigits(nextDigits);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
    if (pasted.length === OTP_LENGTH) void submit(pasted);
  };

  const statusMessage = useMemo(() => {
    if (error) return { tone: "error" as const, text: error.message };
    if (verifying) return { tone: "info" as const, text: "در حال بررسی کد…" };
    if (expired) return { tone: "error" as const, text: "کد تأیید منقضی شده است. کد جدید بگیرید." };
    return null;
  }, [error, verifying, expired]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-cream-50 px-4 py-3">
        <p className="text-sm text-espresso-900">
          کد به شماره{" "}
          <span className="latin font-bold" data-testid="masked-phone">
            {pendingPhone ? maskPhone(pendingPhone) : ""}
          </span>{" "}
          ارسال شد.
        </p>
        <button
          type="button"
          onClick={() => {
            resetFlow();
            router.replace("/auth");
          }}
          className="text-xs font-semibold text-accent-600 underline underline-offset-4 hover:text-accent-500"
        >
          اصلاح شماره
        </button>
      </div>

      <fieldset className="mt-8" disabled={verifying}>
        <legend className="mb-3 text-sm font-semibold text-espresso-900">
          کد تأیید {toPersianDigits(OTP_LENGTH)} رقمی
        </legend>

        <div className="flex justify-between gap-2 sm:gap-3" dir="ltr">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              autoFocus={i === 0}
              disabled={expired}
              aria-label={`رقم ${toPersianDigits(i + 1)} از ${toPersianDigits(OTP_LENGTH)}`}
              aria-invalid={Boolean(error)}
              data-testid={`otp-${i}`}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={onKeyDown(i)}
              onPaste={onPaste}
              onFocus={(e) => e.currentTarget.select()}
              className={cn(
                "h-14 w-full rounded-2xl border bg-white/80 text-center text-xl font-bold text-espresso-900 transition-all duration-200 sm:h-16",
                "focus:border-accent-600 focus:outline-none focus-visible:outline-none",
                error ? "border-danger" : "border-espresso-900/15",
                digit && "border-espresso-900/45 bg-white",
                expired && "opacity-50",
              )}
            />
          ))}
        </div>
      </fieldset>

      <p
        role="status"
        aria-live="polite"
        data-testid="otp-status"
        className={cn(
          "mt-3 min-h-5 text-xs font-medium",
          statusMessage?.tone === "error" ? "text-danger" : "text-ash-600",
        )}
      >
        {statusMessage?.text}
      </p>

      <Button
        type="button"
        size="lg"
        fullWidth
        className="mt-4"
        disabled={!complete || verifying || expired}
        onClick={() => void submit(code)}
        data-testid="verify-code"
      >
        {verifying ? "در حال بررسی…" : "تأیید و ورود"}
      </Button>

      <div className="mt-5 text-center text-xs text-ash-600">
        {resendIn > 0 && !expired ? (
          <span data-testid="resend-countdown">
            ارسال مجدد کد تا {toPersianDigits(resendIn)} ثانیه دیگر
          </span>
        ) : (
          <button
            type="button"
            disabled={sending}
            data-testid="resend-code"
            onClick={async () => {
              setDigits(EMPTY);
              const ok = await resendCode();
              if (ok) {
                toast({ tone: "info", title: "کد جدید ارسال شد" });
                focusBox(0);
              }
            }}
            className="font-semibold text-espresso-900 underline underline-offset-4 transition hover:text-accent-600 disabled:opacity-50"
          >
            {sending ? "در حال ارسال…" : "ارسال مجدد کد"}
          </button>
        )}
        {!expired && challenge && (
          <p className="mt-1.5 text-[0.7rem] text-ash-400">
            اعتبار کد: {toPersianDigits(Math.floor(expiresIn / 60))}:
            {toPersianDigits(String(expiresIn % 60).padStart(2, "0"))}
          </p>
        )}
      </div>
    </div>
  );
}
