"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useFocusTrap, useIsMounted, useLockBodyScroll } from "@/hooks";
import { XIcon } from "./Icons";
import { IconButton } from "./Button";

function Portal({ children }: { children: ReactNode }) {
  const mounted = useIsMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}

/* --------------------------------- Drawer -------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  description,
  side = "start",
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** `start` = right edge in RTL. */
  side?: "start" | "end";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useFocusTrap(open, onClose);
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[100]">
        <div
          className="absolute inset-0 bg-espresso-950/45 backdrop-blur-[3px] animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "absolute inset-y-0 flex w-full max-w-[27rem] flex-col bg-offwhite shadow-[0_0_60px_-10px_rgba(23,13,8,0.5)] animate-drawer-in",
            side === "start" ? "start-0" : "end-0",
            className,
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-beige-300/60 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-espresso-900">{title}</h2>
              {description && (
                <p className="mt-0.5 text-xs text-ash-600">{description}</p>
              )}
            </div>
            <IconButton label="بستن" onClick={onClose} className="-me-2">
              <XIcon className="size-5" />
            </IconButton>
          </header>

          <div className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>

          {footer && (
            <footer className="border-t border-beige-300/60 bg-cream-50/70 px-5 py-4">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* --------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useFocusTrap(open, onClose);
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          className="absolute inset-0 bg-espresso-950/50 backdrop-blur-[3px] animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "relative w-full max-w-lg rounded-t-3xl bg-offwhite p-6 shadow-2xl animate-scale-in sm:rounded-3xl",
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold text-espresso-900">{title}</h2>
            <IconButton label="بستن" onClick={onClose} className="-me-2 -mt-1">
              <XIcon className="size-5" />
            </IconButton>
          </div>
          {children}
        </div>
      </div>
    </Portal>
  );
}

export { Portal };
