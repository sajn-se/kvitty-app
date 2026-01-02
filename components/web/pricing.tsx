import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, GithubLogo, ArrowRight } from "@phosphor-icons/react/dist/ssr";

const features = [
  "Traditionell bokföring",
  "Kvittohantering",
  "Obegränsade verifikationer",
  "Obegränsad lagring",
  "Exportera till SIE-fil",
  "Bjud in teammedlemmar",
];

export function Pricing() {
  return (
    <section id="priser" className="py-20 sm:py-28 px-5 sm:px-[5%] bg-muted/30">
      <div className="mx-auto max-w-[1280px]">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-medium text-2xl sm:text-3xl tracking-tight mb-3">
            Enkel prissättning
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Allt inkluderat. Ingen överraskning.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Hosted plan */}
          <div className="ring-1 ring-border rounded-2xl p-8 bg-card">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">Kvitty Cloud</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-5xl tracking-tight">29</span>
                <span className="text-muted-foreground text-lg">kr/mån</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Exkl. moms.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm"
                >
                  <Check weight="bold" className="size-4 text-green-600 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild className="w-full gap-1.5" size="lg">
              <Link href="/login">
                Kom igång
                <ArrowRight weight="bold" className="size-4" />
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              Ingen kreditkort krävs. Avsluta när du vill.
            </p>
          </div>

          {/* Self-host plan */}
          <div className="ring-1 ring-border rounded-2xl p-8 bg-card">
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">Self-hosted</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-5xl tracking-tight">0</span>
                <span className="text-muted-foreground text-lg">kr/mån</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Hosta på din egen server.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm"
                >
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

            <p className="text-xs text-muted-foreground mt-4">
              Öppen källkod. MIT-licens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
