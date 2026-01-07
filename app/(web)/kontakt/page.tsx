import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Envelope, GithubLogo } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Kontakt — Kvitty",
  description: "Kontakta oss för frågor, support eller feedback om Kvitty.",
};

export default function KontaktPage() {
  return (
    <>
      <section className="py-16 sm:py-24 px-5 sm:px-[5%]">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="font-medium text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
              Kontakta oss
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
              Har du frågor, behöver support eller vill ge feedback? Vi hjälper dig gärna.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="ring-1 ring-border rounded-2xl p-8 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Envelope weight="bold" className="size-6" />
                </div>
                <h2 className="font-medium text-xl">E-post</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Skicka ett e-postmeddelande till oss så svarar vi så snart vi kan.
              </p>
              <Button asChild className="gap-2">
                <a href="mailto:hej@kvitty.se">
                  hej@kvitty.se
                  <ArrowRight weight="bold" className="size-4" />
                </a>
              </Button>
            </div>

            <div className="ring-1 ring-border rounded-2xl p-8 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted">
                  <GithubLogo weight="fill" className="size-6" />
                </div>
                <h2 className="font-medium text-xl">GitHub</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Rapportera buggar, föreslå funktioner eller bidra till projektet på GitHub.
              </p>
              <Button asChild variant="outline" className="gap-2">
                <a
                  href="https://github.com/sajn-se/kvitty-app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Öppna på GitHub
                  <ArrowRight weight="bold" className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-16 max-w-2xl mx-auto">
            <div className="ring-1 ring-border rounded-2xl p-8 bg-muted/30">
              <h2 className="font-medium text-xl mb-4">Företagsinformation</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">RIBBAN AB</strong>
                </p>
                <p>Organisationsnummer: 559254-0321</p>
                <p>
                  E-post:{" "}
                  <a
                    href="mailto:hej@kvitty.se"
                    className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                  >
                    hej@kvitty.se
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-5 sm:px-[5%] bg-muted/30">
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

