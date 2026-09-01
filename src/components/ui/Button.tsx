import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-50 select-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-espresso-900 text-cream-50 hover:bg-espresso-800 shadow-[0_10px_30px_-14px_rgba(34,21,14,0.9)] hover:shadow-[0_18px_40px_-16px_rgba(34,21,14,0.85)]",
  secondary:
    "bg-accent-600 text-white hover:bg-accent-500 shadow-[0_10px_30px_-16px_rgba(168,100,44,0.9)]",
  outline:
    "border border-espresso-900/25 text-espresso-900 hover:border-espresso-900 hover:bg-espresso-900 hover:text-cream-50",
  light:
    "bg-cream-50/95 text-espresso-900 hover:bg-white backdrop-blur-sm border border-white/40",
  ghost: "text-espresso-900 hover:bg-espresso-900/6",
  danger: "bg-danger/10 text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.95rem]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: { label: string } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-espresso-900 transition-colors duration-200 hover:bg-espresso-900/8",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
