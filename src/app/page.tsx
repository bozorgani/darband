import type { Metadata } from "next";
import { Hero, TrustStrip } from "@/components/home/Hero";
import { FeaturedProducts, CoffeeStory, BestSellers } from "@/components/home/Sections";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { CoffeeFinder } from "@/components/home/CoffeeFinder";
import { Subscription, Testimonials } from "@/components/home/Subscription";
import { LifestyleGallery, JournalTeaser } from "@/components/home/Gallery";
import { brand } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: `خرید قهوه تازه‌رست و تخصصی | ${brand.name}` },
  description:
    "خرید آنلاین قهوه دانه و آسیاب‌شده تازه‌رست از قهوینو؛ انتخاب بر اساس خاستگاه، درجه رست، یادداشت‌های طعمی و روش دم‌آوری، به‌همراه تجهیزات دم‌آوری.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts />
      <CategoryShowcase />
      <CoffeeStory />
      <BestSellers />
      <CoffeeFinder />
      <Subscription />
      <Testimonials />
      <LifestyleGallery />
      <JournalTeaser />
    </>
  );
}
