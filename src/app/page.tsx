import type { Metadata } from "next";
import { Hero, TrustStrip } from "@/components/home/Hero";
import { FeaturedProducts, CoffeeStory, BestSellers } from "@/components/home/Sections";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { CoffeeFinder } from "@/components/home/CoffeeFinder";
import { Subscription, Testimonials } from "@/components/home/Subscription";
import { LifestyleGallery, JournalTeaser } from "@/components/home/Gallery";
import { brand } from "@/data/site";

export const metadata: Metadata = {
  title: `${brand.name} | ${brand.tagline}`,
  description:
    "خرید آنلاین قهوه تخصصی تازه رست‌شده: قهوه دانه، آسیاب‌شده، اسپرسو، کپسول و تجهیزات دم‌آوری. ارسال کمتر از ۴۸ ساعت پس از رست.",
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
