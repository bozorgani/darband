import type { Metadata } from "next";
import { DashboardView } from "@/features/account/DashboardView";

export const metadata: Metadata = {
  title: "پیشخوان",
  description: "خلاصه سفارش‌ها، اعتبار و علاقه‌مندی‌های حساب کاربری شما.",
};

export default function AccountPage() {
  return <DashboardView />;
}
