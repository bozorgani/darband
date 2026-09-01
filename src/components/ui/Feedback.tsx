import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "./Button";

/* ------------------------------- EmptyState ------------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondary,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-beige-300 bg-cream-50/50 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-espresso-900/6 text-espresso-800">
        {icon}
      </span>
      <h3 className="text-lg font-bold text-espresso-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm/7 text-ash-600">{description}</p>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      )}
      {secondary && <div className="mt-4">{secondary}</div>}
    </div>
  );
}

/* ------------------------------ SectionHeader ----------------------------- */

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "start",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "start" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <p
            className={cn(
              "eyebrow mb-3",
              tone === "light" && "text-accent-400",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "text-2xl leading-[1.25] sm:text-3xl lg:text-[2.4rem]",
            tone === "light" ? "text-cream-50" : "text-espresso-900",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-3 text-sm/7 sm:text-base/8",
              tone === "light" ? "text-cream-100/75" : "text-ash-600",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* --------------------------------- Divider -------------------------------- */

export function StatBlock({
  value,
  label,
  tone = "dark",
}: {
  value: string;
  label: string;
  tone?: "dark" | "light";
}) {
  return (
    <div>
      <p
        className={cn(
          "text-2xl font-bold sm:text-3xl",
          tone === "light" ? "text-cream-50" : "text-espresso-900",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          tone === "light" ? "text-cream-100/65" : "text-ash-600",
        )}
      >
        {label}
      </p>
    </div>
  );
}
