import { Hero } from "@/components/web/hero";
import { ImageSection } from "@/components/web/image-section";
import { Features } from "@/components/web/features";
import { Pricing } from "@/components/web/pricing";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageSection />
      <Features />
      <Pricing />
    </>
  );
}
