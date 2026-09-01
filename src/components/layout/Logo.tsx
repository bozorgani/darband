import { cn } from "@/lib/utils";

/** Wordmark — inline SVG so it inherits header color and needs no request. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <circle cx="20" cy="20" r="18" strokeOpacity="0.35" />
        <ellipse cx="20" cy="20" rx="8.5" ry="12.5" transform="rotate(32 20 20)" />
        <path d="M15 26c3.2-3 4.6-8.6 3.6-13.4" strokeLinecap="round" />
      </svg>
      <span className="flex h-full flex-col justify-center leading-none">
        <span className="text-[1.35em] font-black tracking-tight">دربند</span>
        <span className="latin mt-0.5 text-[0.5em] font-semibold tracking-[0.38em] opacity-60">
          DARBAND
        </span>
      </span>
    </span>
  );
}
