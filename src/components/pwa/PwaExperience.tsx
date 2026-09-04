"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { XIcon } from "@/components/ui/Icons";
import { useToast } from "@/store/toast";
import { usePathname } from "next/navigation";
import { useStore } from "@/store/store";
import { useFocusTrap, useLockBodyScroll } from "@/hooks";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const INSTALL_DISMISS_KEY = "ghahvino.pwa.install-dismissed.v1";
const INSTALLED_DISPLAY = "(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui)";
function stored(key: string) { try { return sessionStorage.getItem(key); } catch { return null; } }
function remember(key: string) { try { sessionStorage.setItem(key, "1"); } catch { /* Optional storage. */ } }

function isStandalone() {
  return (
    window.matchMedia(INSTALLED_DISPLAY).matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaExperience() {
  const { toast } = useToast();
  const pathname = usePathname();
  const { cartOpen, searchOpen, navOpen } = useStore();
  const sensitive = /^\/(auth|account|cart|wishlist|checkout|payment)(\/|$)/.test(pathname);
  const canPrompt = !sensitive && !cartOpen && !searchOpen && !navOpen;
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const reloadStarted = useRef(false);
  const updateKey = useRef("");
  const closeGuide = useCallback(() => setShowIosGuide(false), []);
  const guideRef = useFocusTrap(showIosGuide, closeGuide);
  useLockBodyScroll(showIosGuide);

  const revealUpdate = useCallback((worker: ServiceWorker) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => { channel.port1.close(); channel.port2.close(); }, 2000);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      updateKey.current = "ghahvino.pwa.update-dismissed." + event.data.version;
      setWaitingWorker(worker);
      setShowUpdate(!stored(updateKey.current));
    };
    worker.postMessage({ type: "GET_VERSION" }, [channel.port2]);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let disposed = false;
    let idleCallbackId: number | undefined;
    let fallbackTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
    const cleanups: Array<() => void> = [];
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (disposed) return;
        if (registration.waiting && navigator.serviceWorker.controller) {
          revealUpdate(registration.waiting);
        }
        const onUpdateFound = () => {
          const installing = registration.installing;
          if (!installing) return;
          const onStateChange = () => {
            if (!disposed && installing.state === "installed" && navigator.serviceWorker.controller) {
              revealUpdate(installing);
            }
          };
          installing.addEventListener("statechange", onStateChange);
          cleanups.push(() => installing.removeEventListener("statechange", onStateChange));
        };
        registration.addEventListener("updatefound", onUpdateFound);
        cleanups.push(() => registration.removeEventListener("updatefound", onUpdateFound));
      } catch {
        // Progressive enhancement: the storefront remains fully usable without a service worker.
      }
    };

    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleCallbackId = window.requestIdleCallback(() => void register(), { timeout: 2500 });
      } else {
        fallbackTimer = globalThis.setTimeout(() => void register(), 1200);
      }
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    const onControllerChange = () => {
      if (!reloadStarted.current) return;
      reloadStarted.current = false;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("load", schedule);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      if (idleCallbackId !== undefined) window.cancelIdleCallback(idleCallbackId);
      if (fallbackTimer !== undefined) globalThis.clearTimeout(fallbackTimer);
    };
  }, [revealUpdate]);

  useEffect(() => {
    if (isStandalone()) return;
    const ios = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
    let iosTimer: number | undefined;
    let installTimer: number | undefined;
    if (ios && !stored(INSTALL_DISMISS_KEY)) {
      iosTimer = window.setTimeout(() => { if (!isStandalone()) setShowIosInstall(true); }, 8000);
    }
    const onInstallable = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      if (!stored(INSTALL_DISMISS_KEY)) {
        window.clearTimeout(installTimer);
        installTimer = window.setTimeout(() => { if (!isStandalone()) setShowInstall(true); }, 8000);
      }
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowInstall(false);
      setShowIosInstall(false);
      setShowIosGuide(false);
      window.clearTimeout(iosTimer);
      window.clearTimeout(installTimer);
    };
    window.addEventListener("beforeinstallprompt", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    const displayMode = window.matchMedia(INSTALLED_DISPLAY);
    const onDisplayChange = () => { if (isStandalone()) onInstalled(); };
    displayMode.addEventListener("change", onDisplayChange);
    return () => {
      if (iosTimer !== undefined) window.clearTimeout(iosTimer);
      window.clearTimeout(installTimer);
      window.removeEventListener("beforeinstallprompt", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", onDisplayChange);
    };
  }, []);

  useEffect(() => {
    let previousOnline = navigator.onLine;
    if (!previousOnline) toast({ tone: "info", title: "اتصال اینترنت قطع شده است", description: "اطلاعات ذخیره‌شده ممکن است به‌روز نباشند؛ خرید و بررسی موجودی به اینترنت نیاز دارد." });
    const onOffline = () => {
      if (previousOnline) {
        toast({
          tone: "info",
          title: "اتصال اینترنت قطع شده است",
          description: "برخی اطلاعات ممکن است به‌روز نباشند.",
        });
      }
      previousOnline = false;
    };
    const onOnline = () => {
      if (!previousOnline) toast({ tone: "success", title: "اتصال اینترنت برقرار شد", description: "شبکه در دسترس است؛ برای بررسی ارتباط با فروشگاه دوباره تلاش کنید." });
      previousOnline = true;
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [toast]);

  async function install() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "dismissed") remember(INSTALL_DISMISS_KEY);
    } catch { /* Browser may revoke a one-shot install event. */ }
    finally { setShowInstall(false); setInstallEvent(null); }
  }

  function dismissInstall() {
    remember(INSTALL_DISMISS_KEY);
    setShowInstall(false);
    setShowIosInstall(false);
  }

  function applyUpdate() {
    if (!waitingWorker || waitingWorker.state !== "installed" || reloadStarted.current || !canPrompt) return;
    reloadStarted.current = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }

  return (
    <>
      {canPrompt && !showUpdate && showInstall && installEvent && (
        <aside
          data-testid="pwa-install-cta"
          aria-label="نصب قهوینو"
          className="pwa-safe-bottom fixed inset-x-3 bottom-3 z-[115] mx-auto max-w-lg rounded-2xl border border-beige-300 bg-cream-50 p-4 text-espresso-900 shadow-[0_24px_64px_-28px_rgba(34,21,14,0.75)] sm:inset-x-auto sm:end-6 sm:bottom-6"
        >
          <button type="button" onClick={dismissInstall} aria-label="بعداً" className="absolute end-3 top-3 rounded-full p-2 text-ash-600 hover:bg-espresso-900/5">
            <XIcon className="size-4" />
          </button>
          <p className="pe-10 text-sm font-bold">قهوینو را نصب کنید</p>
          <p className="mt-1 pe-6 text-xs/5 text-ash-600">سریع‌تر به فروشگاه و قهوه‌های موردعلاقه‌تان دسترسی دارید.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => void install()}>نصب قهوینو</Button>
            <Button type="button" size="sm" variant="ghost" onClick={dismissInstall}>بعداً</Button>
          </div>
        </aside>
      )}

      {canPrompt && !showUpdate && showIosInstall && !installEvent && (
        <aside
          data-testid="pwa-ios-install-cta"
          aria-label="راهنمای نصب قهوینو در آیفون"
          className="pwa-safe-bottom fixed inset-x-3 bottom-3 z-[115] mx-auto max-w-lg rounded-2xl border border-beige-300 bg-cream-50 p-4 text-espresso-900 shadow-[0_24px_64px_-28px_rgba(34,21,14,0.75)] sm:inset-x-auto sm:end-6 sm:bottom-6"
        >
          <button type="button" onClick={dismissInstall} aria-label="بعداً" className="absolute end-3 top-3 rounded-full p-2 text-ash-600 hover:bg-espresso-900/5">
            <XIcon className="size-4" />
          </button>
          <p className="pe-10 text-sm font-bold">قهوینو را به صفحه اصلی اضافه کنید</p>
          <p className="mt-1 pe-6 text-xs/5 text-ash-600">راهنمای کوتاه نصب دستی در Safari را ببینید.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" onClick={() => { setShowIosInstall(false); setShowIosGuide(true); }}>نمایش راهنما</Button>
            <Button type="button" size="sm" variant="ghost" onClick={dismissInstall}>بعداً</Button>
          </div>
        </aside>
      )}

      {canPrompt && showUpdate && waitingWorker && (
        <aside
          data-testid="pwa-update-prompt"
          role="status"
          aria-live="polite"
          className="pwa-safe-bottom fixed inset-x-3 bottom-3 z-[125] mx-auto max-w-lg rounded-2xl bg-espresso-900 p-4 text-cream-50 shadow-[0_24px_64px_-28px_rgba(23,13,8,0.9)] sm:inset-x-auto sm:start-6 sm:bottom-6"
        >
          <p className="text-sm font-bold">نسخه جدید قهوینو آماده است</p>
          <p className="mt-1 text-xs/5 text-cream-100/75">برای دریافت آخرین تغییرات، برنامه را به‌روزرسانی کنید.</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={applyUpdate}>به‌روزرسانی</Button>
            <Button type="button" size="sm" variant="light" onClick={() => { remember(updateKey.current); setShowUpdate(false); }}>بعداً</Button>
          </div>
        </aside>
      )}

      {showIosGuide && (
        <div className="fixed inset-0 z-[130] flex items-end bg-espresso-950/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowIosGuide(false)}>
          <div ref={guideRef} role="dialog" aria-modal="true" aria-labelledby="ios-install-title" className="pwa-safe-bottom max-h-[90svh] w-full overflow-y-auto rounded-[2rem] bg-offwhite p-6 text-espresso-900 shadow-2xl sm:max-w-md">
            <div className="flex items-center justify-between gap-4">
              <h2 id="ios-install-title" className="text-xl">نصب قهوینو در آیفون</h2>
              <button type="button" onClick={() => setShowIosGuide(false)} aria-label="بستن راهنمای نصب" className="rounded-full p-2 hover:bg-espresso-900/5"><XIcon className="size-5" /></button>
            </div>
            <ol className="mt-6 space-y-3 text-sm/7 text-ash-600">
              <li>۱. دکمه اشتراک‌گذاری را لمس کنید.</li>
              <li>۲. گزینه «Add to Home Screen» را انتخاب کنید.</li>
              <li>۳. گزینه Add را بزنید.</li>
            </ol>
            <Button type="button" className="mt-6" fullWidth onClick={() => setShowIosGuide(false)}>متوجه شدم</Button>
          </div>
        </div>
      )}
    </>
  );
}
