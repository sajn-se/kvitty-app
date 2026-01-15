import {
  Books,
  Receipt,
  CheckCircle,
  CurrencyCircleDollar,
  Camera,
  ArrowsLeftRight,
} from "@phosphor-icons/react/dist/ssr";

const modes = [
  {
    icon: Books,
    title: "Traditionell bokföring",
    description:
      "Full dubbel bokföring med stöd för BAS-kontoplanen. Skapa verifikationer, hantera huvudbok och få en komplett översikt över din ekonomi.",
    features: [
      "BAS-kontoplan",
      "Verifikationer",
      "Huvudbok & balansräkning",
      "SIE-export",
    ],
  },
  {
    icon: Receipt,
    title: "Kvittohantering",
    description:
      "Enkel matchning mellan banktransaktioner och kvitton. Ladda upp bilder på kvitton och koppla dem till rätt transaktion.",
    features: [
      "Fotouppladdning",
      "Transaktionsmatchning",
      "Automatisk kategorisering",
      "Exportera underlag",
    ],
  },
];

const additionalFeatures = [
  {
    icon: CurrencyCircleDollar,
    title: "Gratis",
    description: "Helt gratis. Inga dolda avgifter.",
  },
  {
    icon: Camera,
    title: "Fota kvitton",
    description: "Ta kort på kvitton direkt i appen.",
  },
  {
    icon: ArrowsLeftRight,
    title: "Byt när du vill",
    description: "Växla mellan lägena när det passar dig.",
  },
];

export function Features() {
  return (
    <section id="funktioner" className="py-20 sm:py-28 px-5 sm:px-[5%]">
      <div className="mx-auto max-w-[1280px]">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-medium text-2xl sm:text-3xl tracking-tight mb-3">
            Två lägen, en app
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Välj det läge som passar din verksamhet bäst. Eller använd båda.
          </p>
        </div>

        {/* Main mode cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {modes.map((mode) => (
            <div
              key={mode.title}
              className="group ring-1 ring-border rounded-2xl p-6 sm:p-8 bg-card hover:ring-foreground/20 transition-all"
            >
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-5">
                <mode.icon weight="duotone" className="size-6 text-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">{mode.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {mode.description}
              </p>
              <ul className="space-y-2">
                {mode.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle
                      weight="fill"
                      className="size-4 text-green-600"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div className="grid sm:grid-cols-3 gap-6">
          {additionalFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6"
            >
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                <feature.icon
                  weight="duotone"
                  className="size-5 text-foreground"
                />
              </div>
              <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
