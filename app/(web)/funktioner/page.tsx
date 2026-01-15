import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FeaturesTable } from "@/components/web/features-table";
import { ArrowRight, Check, GithubLogo } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Funktioner — Kvitty",
  description: "Jämför funktioner och hitta den plan som passar din verksamhet bäst.",
};

const verificationFeatures = [
  "Kvittohantering",
  "Obegränsade verifikationer",
  "Obegränsad lagring",
  "Bjud in teammedlemmar",
];

const fullFeatures = [
  "Traditionell bokföring",
  "Kvittohantering",
  "Obegränsade verifikationer",
  "Obegränsad lagring",
  "Exportera till SIE-fil",
  "Bjud in teammedlemmar",
];

const hostedBenefits = [
  "Automatiska säkerhetskopior",
  "Uppdateringar ingår",
  "Teknisk support",
];

export default function FunktionerPage() {
  return (
    <>
      {/* Packages Section */}
      <section className="py-16 sm:py-24 px-5 sm:px-[5%]">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
              Välj din plan
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              Från enkel kvittohantering till komplett bokföringssystem.
              Välj den plan som passar din verksamhet.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Verification plan */}
            <div className="ring-1 ring-border rounded-2xl p-6 sm:p-8 bg-card flex flex-col">
              <div className="mb-5">
                <h2 className="font-medium text-lg mb-3">Kvitty Lite</h2>
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-4xl tracking-tight">Gratis</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Alltid gratis.</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {verificationFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check weight="bold" className="size-4 text-green-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mb-6 pt-6 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Ytterligare fördelar
                </p>
                <ul className="space-y-2.5">
                  {hostedBenefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="text-sm text-muted-foreground"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Button asChild className="w-full gap-1.5" size="lg">
                  <Link href="/login">
                    Kom igång
                    <ArrowRight weight="bold" className="size-4" />
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  Ingen bindningstid. Avsluta när du vill.
                </p>
              </div>
            </div>

            {/* Full system plan */}
            <div className="ring-1 ring-border rounded-2xl p-6 sm:p-8 bg-card relative flex flex-col">
              <Badge variant="default" className="absolute top-4 right-4 sm:top-6 sm:right-6">
                Rekommenderas
              </Badge>
              <div className="mb-5">
                <h2 className="font-medium text-lg mb-3">Kvitty Online</h2>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-4xl tracking-tight">Gratis</span>
                  <span className="text-muted-foreground line-through">49 kr/mån</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Normalt 49 kr/mån. Gratis under testfasen.</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {fullFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check weight="bold" className="size-4 text-green-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mb-6 pt-6 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Ytterligare fördelar
                </p>
                <ul className="space-y-2.5">
                  {hostedBenefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="text-sm text-muted-foreground"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto">
                <Button asChild className="w-full gap-1.5" size="lg">
                  <Link href="/login">
                    Kom igång
                    <ArrowRight weight="bold" className="size-4" />
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  Ingen bindningstid. Avsluta när du vill.
                </p>
              </div>
            </div>

            {/* Self-host plan */}
            <div className="ring-1 ring-border rounded-2xl p-6 sm:p-8 bg-card flex flex-col">
              <div className="mb-5">
                <h2 className="font-medium text-lg mb-3">Self-hosted</h2>
                <div className="flex items-baseline gap-1">
                  <span className="font-semibold text-4xl tracking-tight">0</span>
                  <span className="text-muted-foreground">kr/mån</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">Hosta själv</p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {fullFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check weight="bold" className="size-4 text-green-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" className="w-full gap-1.5" size="lg">
                <a
                  href="https://github.com/sajn-se/kvitty-app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubLogo weight="fill" className="size-4" />
                  Visa på GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Table Section */}
      <section className="py-12 sm:py-20 px-5 sm:px-[5%] bg-muted/30">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-medium text-2xl sm:text-3xl tracking-tight mb-3">
              Jämför alla funktioner
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Se vilka funktioner som ingår i varje plan.
            </p>
          </div>

          <FeaturesTable />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-5 sm:px-[5%]">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-medium text-2xl sm:text-3xl tracking-tight mb-3">
              Redo att komma igång?
            </h2>
            <p className="text-muted-foreground mb-8">
              Skapa ett konto gratis och testa Kvitty i 14 dagar utan kostnad.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-1.5">
                <Link href="/signup">
                  Kom igång gratis
                  <ArrowRight weight="bold" className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#priser">
                  Se priser
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
