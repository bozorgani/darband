"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, DiscountCode, Product } from "@/types";
import { useIsMounted, usePersistentState } from "@/hooks";
import { useToast } from "./toast";

/* ============================== Cart reducer ============================== */

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem }
  | { type: "remove"; key: string }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "clear" };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "add": {
      const existing = state.find((i) => i.key === action.item.key);
      if (existing) {
        return state.map((i) =>
          i.key === action.item.key
            ? { ...i, quantity: Math.min(99, i.quantity + action.item.quantity) }
            : i,
        );
      }
      return [...state, action.item];
    }
    case "remove":
      return state.filter((i) => i.key !== action.key);
    case "setQuantity":
      return state
        .map((i) =>
          i.key === action.key
            ? { ...i, quantity: Math.max(0, Math.min(99, action.quantity)) }
            : i,
        )
        .filter((i) => i.quantity > 0);
    case "clear":
      return [];
    default:
      return state;
  }
}

/* ============================== Mock pricing ============================== */

/** TODO(backend): discount validation + shipping rates come from the API. */
export const MOCK_DISCOUNTS: DiscountCode[] = [
  { code: "DARBAND10", percentage: 0.1, label: "۱۰٪ تخفیف خوش‌آمدگویی" },
  { code: "FILTER20", percentage: 0.2, label: "۲۰٪ تخفیف قهوه‌های فیلتر" },
];

export const FREE_SHIPPING_THRESHOLD = 1_500_000;
export const SHIPPING_FLAT_RATE = 89_000;

/* ================================ Context ================================ */

interface StoreContextValue {
  /* cart */
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key"> & { key?: string }) => void;
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: DiscountCode | null;
  discountAmount: number;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  shipping: number;
  total: number;
  freeShippingRemaining: number;

  /* wishlist */
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeWishlist: (id: string) => void;

  /* ui */
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;

  /* search history */
  recentSearches: string[];
  pushRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  hydrated: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "darband.cart.v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, dispatch] = useReducer(cartReducer, [] as CartItem[]);
  const [cartHydrated, setCartHydrated] = useState(false);

  const [wishlist, setWishlist, wishlistHydrated] = usePersistentState<string[]>(
    "darband.wishlist.v1",
    [],
  );
  const [recentSearches, setRecentSearches] = usePersistentState<string[]>(
    "darband.searches.v1",
    [],
  );
  const [discount, setDiscount] = useState<DiscountCode | null>(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  /* -------- cart persistence (localStorage stands in for a real cart API) - */
  const mounted = useIsMounted();
  if (mounted && !cartHydrated) {
    setCartHydrated(true);
    try {
      const raw = window.localStorage.getItem(CART_KEY);
      if (raw) dispatch({ type: "hydrate", items: JSON.parse(raw) as CartItem[] });
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, cartHydrated]);

  /* --------------------------------- cart -------------------------------- */

  const addItem = useCallback<StoreContextValue["addItem"]>(
    (item) => {
      const key =
        item.key ??
        `${item.productId}__${item.options.map((o) => o.value).join("_") || "default"}`;
      dispatch({ type: "add", item: { ...item, key } });
      toast({
        tone: "success",
        title: "به سبد خرید اضافه شد",
        description: item.title,
        actionLabel: "مشاهده سبد",
        onAction: () => setCartOpen(true),
      });
    },
    [toast],
  );

  const addProduct = useCallback<StoreContextValue["addProduct"]>(
    (product, quantity = 1) => {
      addItem({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0],
        unitPrice: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity,
        options: [],
      });
    },
    [addItem],
  );

  const removeItem = useCallback(
    (key: string) => {
      const target = items.find((i) => i.key === key);
      dispatch({ type: "remove", key });
      toast({
        tone: "danger",
        title: "از سبد خرید حذف شد",
        description: target?.title,
      });
    },
    [items, toast],
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "setQuantity", key, quantity });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const discountAmount = discount ? Math.round(subtotal * discount.percentage) : 0;
  const shipping =
    items.length === 0 || subtotal - discountAmount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_FLAT_RATE;
  const total = Math.max(0, subtotal - discountAmount + shipping);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const applyDiscount = useCallback(
    (code: string) => {
      const found = MOCK_DISCOUNTS.find(
        (d) => d.code.toLowerCase() === code.trim().toLowerCase(),
      );
      if (found) {
        setDiscount(found);
        toast({ tone: "success", title: "کد تخفیف اعمال شد", description: found.label });
        return true;
      }
      toast({ tone: "danger", title: "کد تخفیف معتبر نیست", description: "کد وارد شده را بررسی کنید." });
      return false;
    },
    [toast],
  );

  const removeDiscount = useCallback(() => setDiscount(null), []);

  /* ------------------------------- wishlist ------------------------------ */

  const isWishlisted = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const exists = wishlist.includes(product.id);
      /* Keep the updater pure — side effects live outside of it. */
      setWishlist((prev) =>
        prev.includes(product.id)
          ? prev.filter((id) => id !== product.id)
          : [...prev, product.id],
      );
      toast(
        exists
          ? { tone: "info", title: "از علاقه‌مندی‌ها حذف شد", description: product.title }
          : { tone: "wishlist", title: "به علاقه‌مندی‌ها اضافه شد", description: product.title },
      );
    },
    [wishlist, setWishlist, toast],
  );

  const removeWishlist = useCallback(
    (id: string) => setWishlist((prev) => prev.filter((x) => x !== id)),
    [setWishlist],
  );

  /* ------------------------------- searches ------------------------------ */

  const pushRecentSearch = useCallback(
    (term: string) => {
      const value = term.trim();
      if (value.length < 2) return;
      setRecentSearches((prev) =>
        [value, ...prev.filter((t) => t !== value)].slice(0, 6),
      );
    },
    [setRecentSearches],
  );

  const clearRecentSearches = useCallback(
    () => setRecentSearches([]),
    [setRecentSearches],
  );

  /* --------------------------- global shortcuts -------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      items,
      addItem,
      addProduct,
      removeItem,
      setQuantity,
      clearCart,
      itemCount,
      subtotal,
      discount,
      discountAmount,
      applyDiscount,
      removeDiscount,
      shipping,
      total,
      freeShippingRemaining,
      wishlist,
      isWishlisted,
      toggleWishlist,
      removeWishlist,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      navOpen,
      setNavOpen,
      recentSearches,
      pushRecentSearch,
      clearRecentSearches,
      hydrated: cartHydrated && wishlistHydrated,
    }),
    [
      items,
      addItem,
      addProduct,
      removeItem,
      setQuantity,
      clearCart,
      itemCount,
      subtotal,
      discount,
      discountAmount,
      applyDiscount,
      removeDiscount,
      shipping,
      total,
      freeShippingRemaining,
      wishlist,
      isWishlisted,
      toggleWishlist,
      removeWishlist,
      cartOpen,
      searchOpen,
      navOpen,
      recentSearches,
      pushRecentSearch,
      clearRecentSearches,
      cartHydrated,
      wishlistHydrated,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
