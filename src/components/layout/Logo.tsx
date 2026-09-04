import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Gold is reserved for the dark homepage hero; other surfaces inherit their text color. */
  markTone?: "inherit" | "gold";
};

/** Official Ghahvino logomark plus wordmark; inline to avoid a render-blocking request. */
export function Logo({ className, markTone = "inherit" }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 700 700"
        className={cn("h-full w-auto shrink-0", markTone === "gold" && "text-[#e59141]")}
        fill="currentColor"
        aria-hidden="true"
      >
        <g transform="translate(67 82)">
          <path d="M477 71 C415 38 354 15 287 15 C143 15 27 133 27 278 C27 418 133 517 274 517 C363 517 432 480 502 431 L502 326 C502 301 512 289 535 282 Q538 281 538 278 Q538 275 534 275 L305 275 Q301 275 301 279 Q301 283 305 283 L363 283 C389 283 400 296 400 323 L400 427 C400 481 350 504 280 504 C179 504 132 412 132 281 C132 144 193 30 287 30 C368 30 427 92 463 191 L477 191 Z" />
          <path d="M194 478 C172 431 199 377 244 340 C290 302 346 286 385 307 C433 334 436 388 403 434 C358 495 271 538 214 504 C280 492 304 452 337 411 C356 388 376 367 402 348 C354 365 322 389 291 422 C260 455 234 475 194 478 Z" />
        </g>
      </svg>
      <span className="flex h-full flex-col justify-center leading-none">
        <span className="text-[1.3em] font-black tracking-tight">قهوینو</span>
        <span
          aria-hidden="true"
          className="latin mt-0.5 text-[0.46em] font-semibold tracking-[0.3em] opacity-60"
        >
          GHAHVINO
        </span>
      </span>
    </span>
  );
}
