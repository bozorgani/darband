import type { Metadata } from "next";
import { ProfileView } from "@/features/account/ProfileView";

export const metadata: Metadata = {
  title: "اطلاعات حساب",
  description: "ویرایش نام، ایمیل و شماره موبایل حساب کاربری.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
