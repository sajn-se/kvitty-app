import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
  Produkt: [
    { label: "Funktioner", href: "#funktioner" },
    { label: "Priser", href: "#priser" },
    { label: "Logga in", href: "/login" },
  ],
  Resurser: [
    { label: "Dokumentation", href: "https://github.com/sajn-se/kvitty-app#readme", external: true },
    { label: "GitHub", href: "https://github.com/sajn-se/kvitty-app", external: true },
  ],
  Juridiskt: [
    { label: "Integritetspolicy", href: "/privacy" },
    { label: "Datasäkerhet", href: "/datasecurity" },
    { label: "Villkor", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-5 sm:px-[5%]">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-semibold text-lg tracking-tight">
              Kvitty
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-[200px]">
              Enkel bokföring för småföretag.
            </p>
            <a
              href="mailto:hej@kvitty.se"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-3 block"
            >
              hej@kvitty.se
            </a>
            <a
              href="https://github.com/sajn-se/kvitty-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubLogo weight="fill" className="size-5" />
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} Kvitty. Öppen källkod under MIT-licens.
          </p>
          <p className="text-xs text-muted-foreground">
            Ett projekt från{" "}
            <a
              href="https://sajn.se"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              sajn
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
