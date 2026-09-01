"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const noopSubscribe = () => () => {};

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 * Lets client-only data (localStorage) be read without hydration mismatches.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Persisted state helper — SSR-safe, reads from localStorage after mount. */
export function usePersistentState<T>(key: string, initial: T) {
  const mounted = useIsMounted();
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  /* Render-phase hydration: runs once, immediately after mount. */
  if (mounted && !hydrated) {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupt storage */
    }
  }

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}

/** Reveal-on-scroll. Adds `.is-visible` once the element enters the viewport. */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Locks body scroll while an overlay is open (drawer, modal, search). */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    const paddingRight = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (paddingRight > 0) document.body.style.paddingLeft = `${paddingRight}px`;
    return () => {
      document.body.style.overflow = original;
      document.body.style.paddingLeft = "";
    };
  }, [locked]);
}

/** Header behaviour: transparent at top, condensed & hidden on scroll down. */
export function useScrollState() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        setHidden(y > 320 && y > lastY.current);
        lastY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled, hidden };
}

/** Traps Tab focus inside an element — used by Drawer / Modal / Search. */
export function useFocusTrap(
  active: boolean,
  onClose: () => void,
) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    const previous = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    const timer = window.setTimeout(() => focusables()[0]?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [active, onClose]);

  return ref;
}

/** Debounced value — used for search-as-you-type. */
export function useDebounced<T>(value: T, delay = 180): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Simulates async data loading so skeleton states are demonstrable. */
export function useSimulatedLoading(deps: unknown[], ms = 420) {
  const [loading, setLoading] = useState(false);
  const first = useRef(true);

  const trigger = useCallback(() => {
    setLoading(true);
    const id = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(id);
  }, [ms]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    return trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
