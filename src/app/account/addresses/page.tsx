import type { Metadata } from "next";
import { AddressesView } from "@/features/account/AddressesView";

export const metadata: Metadata = {
  title: "نشانی‌ها",
  description: "مدیریت نشانی‌های تحویل سفارش.",
};

export default function AddressesPage() {
  return <AddressesView />;
}
