import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveUpRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 sm:px-[5%]">
      <div className="pt-20 relative z-10">
        <div className="mx-auto max-w-[1280px]">
          {/* Mobile and Tablet Layout */}
          <div className="flex flex-col gap-8 md:gap-10 pb-12 lg:hidden">
            <div className="flex flex-col gap-5 md:gap-6">
              <h1 className="font-medium text-4xl sm:text-5xl md:text-5xl leading-[1.1] tracking-tight">
                <span>Bokföring som</span>
                <br /> bara fungerar
              </h1>
            </div>

            <div>
              <p className="text-muted-foreground text-base sm:text-base md:text-lg max-w-[90%] leading-relaxed">
                Hantera kvitton och transaktioner enkelt och smidigt. Välj det som passar dig:{" "}
                <span className="font-medium text-black/85">
                  fullständig bokföring eller enkel kvittohantering.
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="xl" className="group text-sm lg:text-base lg:px-6 px-4" asChild>
                <Link href="/login">
                  Kom igång gratis
                  <span className="relative overflow-hidden size-4 ml-1">
                    <MoveUpRight className="absolute size-4 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full" />
                    <MoveUpRight className="absolute size-4 -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                  </span>
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="text-sm lg:text-base lg:px-6 px-4" asChild>
                <a href="#priser">Se priser</a>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm sm:text-sm text-muted-foreground -mt-4">
              <span>Testa gratis — inget kreditkort krävs</span>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-end pb-6">
            <div className="flex flex-col gap-8 max-w-[65%]">
              <h1 className="font-medium text-[56px] leading-[1.1] tracking-tight">
                <span>Bokföring som</span>
                <br /> bara fungerar
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="xl" className="group text-base px-6" asChild>
                  <Link href="/login">
                    Kom igång gratis
                    <span className="relative overflow-hidden size-4 ml-1">
                      <MoveUpRight className="absolute size-4 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full" />
                      <MoveUpRight className="absolute size-4 -translate-x-full translate-y-full transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0" />
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="text-base px-6" asChild>
                  <a href="#priser">Se priser</a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm text-muted-foreground -mt-4">
                <span>Testa gratis — inget kreditkort krävs</span>
              </div>
            </div>

            <div className="shrink-0">
              <p className="text-muted-foreground text-base max-w-[380px] leading-relaxed">
                Hantera kvitton och transaktioner enkelt och smidigt. Välj det som passar dig:{" "}
                <br />
                <span className="font-medium text-black/85">
                  fullständig bokföring eller enkel kvittohantering.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
