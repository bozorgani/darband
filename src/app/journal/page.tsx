import { absoluteUrl, sharedOpenGraph } from "@/config/site";
import type { Metadata } from "next";
import { JournalView } from "@/components/journal/JournalView";
import { Breadcrumb } from "@/components/ui/Disclosure";

export const metadata: Metadata = {
  title: "ژورنال و آموزش قهوه",
  description:
    "آموزش دم‌آوری قهوه، راهنمای خرید قهوه، انتخاب درجه آسیاب، تفاوت انواع رست و نگهداری قهوه؛ نوشته‌های تیم قهوینو.",
  alternates: { canonical: "/journal" },
  openGraph: {
    ...sharedOpenGraph,
    type: "website",
    url: absoluteUrl("/journal"),
    title: "ژورنال قهوه قهوینو",
    description: "راهنمای دم‌آوری، دانش قهوه و گزارش‌های سفر خاستگاه.",
  },
};

export default function JournalPage() {
  return (
    <>
      <div className="border-b border-beige-300/60 bg-cream-50">
        <div className="container-page py-10 lg:py-14">
          <Breadcrumb items={[{ label: "خانه", href: "/" }, { label: "ژورنال" }]} />
          <h1 className="mt-4 text-3xl font-black text-espresso-900 sm:text-4xl">ژورنال و آموزش قهوه قهوینو</h1>
          <p className="mt-3 max-w-2xl text-sm/7 text-ash-600">
            هرچه درباره قهوه یاد گرفته‌ایم، بدون رمز و راز. از دستور دم‌آوری تا شیمی آب.
          </p>
        </div>
      </div>
      <JournalView />
    </>
  );
}
