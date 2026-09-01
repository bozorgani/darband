"use client";

import type { ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper. Content is visible by default if JS is disabled
 * (see `.no-js .reveal` in globals.css) — this is progressive enhancement only.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
