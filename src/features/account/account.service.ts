import type { CartItem } from "@/types";
import { normalizeText } from "@/lib/utils";
import { toEnglishDigits } from "@/lib/format";
import type {
  Address,
  AddressPayload,
  AppNotification,
  Order,
  OrderStatus,
} from "./account.types";

/**
 * Account data helpers.
 *
 * TODO(backend): every function here stands in for an endpoint:
 *   GET    /api/account/orders               -> Order[]
 *   GET    /api/account/orders/:id           -> Order
 *   GET    /api/account/addresses            -> Address[]
 *   POST   /api/account/addresses            -> Address
 *   PATCH  /api/account/addresses/:id        -> Address
 *   DELETE /api/account/addresses/:id
 *   GET    /api/account/notifications        -> AppNotification[]
 *   PATCH  /api/account/notifications/read
 * State is kept in `localStorage` for the demo (see `AccountProvider`).
 */

/* Legacy `darband.*` storage keys are kept intentionally after the Ghahvino
   rebrand: they are internal, never exposed to users or crawlers, and renaming
   them would drop existing carts / wishlists / sessions of returning visitors.
   See RESPONSIVE_SEO_AUDIT.md § «کلیدهای ذخیره‌سازی». */
export const STORAGE_KEYS = {
  addresses: "darband.account.addresses.v1",
  notifications: "darband.account.notifications.v1",
  prefs: "darband.account.prefs.v1",
} as const;

export function createAddressId(): string {
  return `a-${Date.now().toString(36)}`;
}

export function buildAddress(payload: AddressPayload, id = createAddressId()): Address {
  return { ...payload, id };
}

/** Default address always first, then alphabetical by title. */
export function sortAddresses(list: Address[]): Address[] {
  return [...list].sort((a, b) => {
    if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
    return a.title.localeCompare(b.title, "fa");
  });
}

export interface OrderQuery {
  status: OrderStatus | "all";
  query: string;
}

export function filterOrders(orders: Order[], { status, query }: OrderQuery): Order[] {
  const term = normalizeText(toEnglishDigits(query)).replace(/\s/g, "");
  return orders.filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    if (!term) return true;
    const haystack = normalizeText(
      `${order.number} ${order.items.map((i) => i.title).join(" ")}`,
    ).replace(/\s/g, "");
    return haystack.includes(term);
  });
}

export function unreadCount(items: AppNotification[]): number {
  return items.filter((n) => !n.read).length;
}

/** Maps a past order back onto cart items (the "buy again" action). */
export function orderToCartItems(order: Order): Omit<CartItem, "key">[] {
  return order.items.map((item) => ({
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    image: item.image,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    options: item.options,
  }));
}

export const orderStatusTone: Record<
  OrderStatus,
  "default" | "dark" | "accent" | "success" | "danger" | "outline"
> = {
  "awaiting-payment": "outline",
  processing: "accent",
  shipped: "dark",
  delivered: "success",
  cancelled: "danger",
};
