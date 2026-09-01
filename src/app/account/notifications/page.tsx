import type { Metadata } from "next";
import { NotificationsView } from "@/features/account/NotificationsView";

export const metadata: Metadata = {
  title: "اعلان‌ها",
  description: "پیام‌های سفارش، پیشنهادها و تنظیمات اطلاع‌رسانی.",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
