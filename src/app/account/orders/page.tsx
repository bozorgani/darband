import type { Metadata } from "next";
import { OrdersView } from "@/features/account/OrdersView";

export const metadata: Metadata = {
  title: "سفارش‌های من",
  description: "پیگیری وضعیت سفارش‌های ثبت‌شده در دربند.",
};

export default function OrdersPage() {
  return <OrdersView />;
}
