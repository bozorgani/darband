/**
 * Customer-account domain types (orders, addresses, notifications).
 *
 * TODO(backend): these mirror `GET /api/account/*` responses. The mock service
 * in `account.service.ts` is the only place that needs to change.
 */

export type OrderStatus =
  | "awaiting-payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  slug: string;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
  options: { label: string; value: string }[];
}

export interface OrderTimelineStep {
  key: string;
  label: string;
  /** Jalali date string for display, e.g. `۱۴۰۴/۰۵/۱۲ — ۱۴:۳۰`. */
  date?: string;
  done: boolean;
}

export interface Order {
  id: string;
  /** Human-facing order number, already Persian-formatted at display time. */
  number: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentRef?: string;
  addressId: string;
  trackingCode?: string;
  timeline: OrderTimelineStep[];
}

export interface Address {
  id: string;
  title: string;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  line: string;
  plaque: string;
  unit?: string;
  postalCode: string;
  note?: string;
  isDefault: boolean;
}

export type AddressPayload = Omit<Address, "id">;

export type NotificationKind = "order" | "offer" | "stock" | "account";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  date: string;
  read: boolean;
  href?: string;
}

export interface NotificationPrefs {
  orderSms: boolean;
  offers: boolean;
  newsletter: boolean;
}
