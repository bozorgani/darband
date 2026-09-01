"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronLeftIcon } from "./Icons";
import { toPersianDigits } from "@/lib/format";

/* -------------------------------- Accordion ------------------------------- */

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const baseId = useId();

  return (
    <div className={cn("divide-y divide-beige-300/70 border-y border-beige-300/70", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-${item.id}`}
                className="flex w-full items-center justify-between gap-4 py-4 text-start text-sm font-semibold text-espresso-900 transition-colors hover:text-accent-600"
              >
                {item.title}
                <ChevronDownIcon
                  className={cn(
                    "size-4 shrink-0 text-ash-600 transition-transform duration-300",
                    isOpen && "rotate-180 text-accent-600",
                  )}
                />
              </button>
            </h3>
            <div
              id={`${baseId}-${item.id}`}
              hidden={!isOpen}
              className="pb-5 text-sm/7 text-ash-600 animate-fade-in"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */

export function Tabs({
  tabs,
  className,
  panelClassName,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  className?: string;
  panelClassName?: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const baseId = useId();

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="بخش‌ها"
        className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-beige-300/70"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors duration-200",
                selected ? "text-espresso-900" : "text-ash-600 hover:text-espresso-800",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600 transition-transform duration-300",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          className={cn("pt-6 animate-fade-in", panelClassName)}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Breadcrumb ------------------------------- */

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="مسیر صفحه" className={cn("text-xs text-ash-600", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.href ? (
              <Link
                href={item.href}
                className="transition-colors hover:text-espresso-900 hover:underline underline-offset-4"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-espresso-800">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && (
              <ChevronLeftIcon className="size-3.5 text-ash-400" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------- Pagination ------------------------------- */

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav aria-label="صفحه‌بندی" className="flex items-center justify-center gap-1.5 pt-4">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="صفحه قبل"
        className="flex size-10 items-center justify-center rounded-full border border-espresso-900/15 text-espresso-800 transition hover:border-espresso-900 disabled:opacity-35 disabled:hover:border-espresso-900/15"
      >
        <ChevronRightIconLocal />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <span key={p} className="flex items-center gap-1.5">
            {prev && p - prev > 1 && <span className="px-1 text-ash-400">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-sm font-semibold transition",
                p === page
                  ? "bg-espresso-900 text-cream-50"
                  : "border border-espresso-900/15 text-espresso-800 hover:border-espresso-900",
              )}
            >
              {toPersianDigits(p)}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="صفحه بعد"
        className="flex size-10 items-center justify-center rounded-full border border-espresso-900/15 text-espresso-800 transition hover:border-espresso-900 disabled:opacity-35 disabled:hover:border-espresso-900/15"
      >
        <ChevronLeftIcon className="size-4" />
      </button>
    </nav>
  );
}

function ChevronRightIconLocal() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 6l6 6-6 6" />
    </svg>
  );
}
