import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { discountPercent, formatNumber, formatPrice, formatRating, toPersianDigits } from "@/lib/format";
import { StarIcon } from "./Icons";

/* --------------------------------- Badge --------------------------------- */

type BadgeTone = "default" | "dark" | "accent" | "success" | "danger" | "outline";

const badgeTones: Record<BadgeTone, string> = {
  default: "bg-cream-100 text-espresso-800",
  dark: "bg-espresso-900 text-cream-50",
  accent: "bg-accent-600 text-white",
  success: "bg-success/12 text-success",
  danger: "bg-danger/12 text-danger",
  outline: "border border-espresso-900/20 text-espresso-800",
};

export function Badge({
  tone = "default",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold leading-none",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Rating --------------------------------- */

export function Rating({
  value,
  count,
  size = "sm",
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const starSize = size === "sm" ? "size-3.5" : "size-[1.05rem]";
  return (
    <div
      role="img"
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`امتیاز ${formatRating(value)} از ۵${count ? ` بر اساس ${toPersianDigits(count)} نظر` : ""}`}
    >
      <div className="flex items-center gap-0.5 text-accent-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            filled={value >= i - 0.25}
            className={cn(starSize, value >= i - 0.25 ? "opacity-100" : "opacity-30")}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-espresso-800">
          {formatRating(value)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-ash-600">({toPersianDigits(count)})</span>
      )}
    </div>
  );
}

/* --------------------------------- Price --------------------------------- */

export function Price({
  value,
  compareAt,
  size = "md",
  className,
}: {
  value: number;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const off = discountPercent(value, compareAt);
  const sizing = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  }[size];

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-bold text-espresso-900", sizing)}>
        {formatNumber(value)}
        <span className="ms-1 text-[0.7em] font-medium text-ash-600">تومان</span>
      </span>
      {compareAt && off && (
        <>
          <span className="text-xs text-ash-400 line-through decoration-danger/60">
            {formatNumber(compareAt)}
          </span>
          <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[0.65rem] font-bold text-danger">
            {toPersianDigits(off)}٪−
          </span>
        </>
      )}
    </div>
  );
}

export { formatPrice };

/* --------------------------------- Input --------------------------------- */

export function Input({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: {
  label?: string;
  hint?: string;
  error?: string;
} & ComponentProps<"input">) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-semibold text-espresso-800"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          "h-11 w-full rounded-full border border-espresso-900/15 bg-white/80 px-4 text-sm text-espresso-900 placeholder:text-ash-400 transition-colors duration-200",
          "hover:border-espresso-900/30 focus:border-accent-600 focus:outline-none focus-visible:outline-none",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-[0.7rem] text-ash-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-[0.7rem] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------- Checkbox -------------------------------- */

export function Checkbox({
  label,
  count,
  checked,
  onChange,
  name,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-espresso-800">
      <span className="relative flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border border-espresso-900/25 bg-white transition-colors duration-200 group-hover:border-espresso-900/50 has-[:checked]:border-espresso-900 has-[:checked]:bg-espresso-900">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <svg
          viewBox="0 0 16 16"
          className={cn(
            "pointer-events-none size-3 text-cream-50 transition-opacity duration-150",
            checked ? "opacity-100" : "opacity-0",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m3 8.4 3.2 3.2L13 4.8" />
        </svg>
      </span>
      <span className="flex-1 transition-colors group-hover:text-espresso-950">{label}</span>
      {count !== undefined && (
        <span className="text-[0.7rem] text-ash-400">{toPersianDigits(count)}</span>
      )}
    </label>
  );
}

/* ------------------------------- Skeleton -------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-xl", className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 w-full rounded-2xl" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-24" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-3 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
