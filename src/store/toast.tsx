"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckIcon, HeartIcon, InfoIcon, TrashIcon, XIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "info" | "danger" | "wishlist";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++counter;
      setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:bottom-6 sm:left-6 sm:right-auto sm:items-start sm:p-0"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const toneStyles: Record<ToastTone, string> = {
  success: "bg-espresso-900 text-cream-50",
  info: "bg-espresso-900 text-cream-50",
  danger: "bg-danger text-white",
  wishlist: "bg-accent-600 text-white",
};

const toneIcon: Record<ToastTone, ReactNode> = {
  success: <CheckIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  danger: <TrashIcon className="size-4" />,
  wishlist: <HeartIcon className="size-4" filled />,
};

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_40px_-18px_rgba(34,21,14,0.7)] animate-scale-in",
        toneStyles[toast.tone],
      )}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15">
        {toneIcon[toast.tone]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-xs/5 opacity-80">{toast.description}</p>
        )}
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
            className="mt-2 text-xs font-semibold underline underline-offset-4 hover:opacity-80"
          >
            {toast.actionLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="بستن اعلان"
        className="-me-1 rounded-full p-1 opacity-70 transition hover:opacity-100"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
