import type { Metadata } from "next";
import { ComparisonHero } from "@/components/web/comparison/comparison-hero";
import { HighlightCards } from "@/components/web/comparison/highlight-cards";
import { FeatureTable } from "@/components/web/comparison/feature-table";
import { ComparisonCTA } from "@/components/web/comparison/comparison-cta";

export const metadata: Metadata = {
  title: "Bokio vs Kvitty — Jämförelse av bokföringsprogram",
  description:
    "Jämför Bokio och Kvitty: funktioner, priser och vad som passar ditt företag bäst. Kvitty erbjuder gratis bokföring med öppen källkod.",
  keywords: [
    "bokio vs kvitty",
    "bokföringsprogram jämförelse",
    "billigt bokföringsprogram",
    "bokföring småföretag",
    "bokio alternativ",
  ],
};

export default function BokioVsKvittyPage() {
  return (
    <>
      <ComparisonHero />
      <HighlightCards />
      <FeatureTable />
      <ComparisonCTA />
    </>
  );
}
