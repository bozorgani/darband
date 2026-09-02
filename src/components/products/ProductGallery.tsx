"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ZoomIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { Modal } from "@/components/ui/Overlay";
import { toPersianDigits } from "@/lib/format";

/** Product gallery: thumbnails on desktop, swipeable strip on mobile, zoom modal. */
export function ProductGallery({
  images,
  title,
  badges,
}: {
  images: string[];
  title: string;
  badges?: string[];
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + images.length) % images.length);

  return (
    <div className="lg:sticky lg:top-28">
      <div className="flex flex-col-reverse gap-4 lg:flex-row">
        {/* Thumbnails */}
        <div
          className="hide-scrollbar flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible"
          role="tablist"
          aria-label="تصاویر محصول"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              role="tab"
              aria-selected={i === active}
              aria-label={`تصویر ${toPersianDigits(i + 1)}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100 transition-all duration-300 lg:w-full",
                i === active
                  ? "ring-2 ring-espresso-900 ring-offset-2 ring-offset-offwhite"
                  : "opacity-65 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                priority={i === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Main image */}
        <div className="relative flex-1">
          <div className="group relative aspect-square overflow-hidden rounded-3xl bg-cream-100">
            {images.map((src, i) => (
              <Image
                key={src + i}
                src={src}
                alt={`${title} — تصویر ${toPersianDigits(i + 1)}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={cn(
                  "object-cover transition-opacity duration-500",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              />
            ))}

            {badges && badges.length > 0 && (
              <div className="absolute inset-x-4 top-4 flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-espresso-950/80 px-3 py-1 text-[0.68rem] font-semibold text-cream-50 backdrop-blur-sm"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label="بزرگ‌نمایی تصویر"
              className="absolute bottom-4 end-4 flex size-10 items-center justify-center rounded-full bg-offwhite/90 text-espresso-900 shadow-lg backdrop-blur-sm transition hover:bg-offwhite"
            >
              <ZoomIcon className="size-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="تصویر قبلی"
                  className="absolute start-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-offwhite/85 text-espresso-900 opacity-0 shadow transition group-hover:opacity-100 max-lg:opacity-100"
                >
                  <ChevronRightIcon className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="تصویر بعدی"
                  className="absolute end-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-offwhite/85 text-espresso-900 opacity-0 shadow transition group-hover:opacity-100 max-lg:opacity-100"
                >
                  <ChevronLeftIcon className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile dots */}
          <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`نمایش تصویر ${toPersianDigits(i + 1)}`}
                className="flex h-6 min-w-6 items-center justify-center px-1"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1.5 rounded-full transition-all",
                    i === active ? "w-6 bg-espresso-900" : "w-1.5 bg-beige-300",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Modal open={zoom} onClose={() => setZoom(false)} title={title} className="max-w-3xl">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream-100">
          <Image
            src={images[active]}
            alt={title}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
