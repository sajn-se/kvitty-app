import { Fragment } from "react";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";

type Plan = "verification" | "full" | "selfHosted";

interface Feature {
  name: string;
  plans: Plan[];
}

interface FeatureCategory {
  name: string;
  features: Feature[];
}

const featureCategories: FeatureCategory[] = [
  {
    name: "Kvittohantering",
    features: [
      { name: "Kvittohantering", plans: ["verification", "full", "selfHosted"] },
      { name: "Fotouppladdning", plans: ["verification", "full", "selfHosted"] },
      { name: "Transaktionsmatchning", plans: ["verification", "full", "selfHosted"] },
      { name: "Automatisk kategorisering", plans: ["verification", "full", "selfHosted"] },
    ],
  },
  {
    name: "Verifikationer & lagring",
    features: [
      { name: "Obegränsade verifikationer", plans: ["verification", "full", "selfHosted"] },
      { name: "Obegränsad lagring", plans: ["verification", "full", "selfHosted"] },
    ],
  },
  {
    name: "Bokföring",
    features: [
      { name: "Traditionell bokföring", plans: ["full", "selfHosted"] },
      { name: "BAS-kontoplan", plans: ["full", "selfHosted"] },
      { name: "Huvudbok & balansräkning", plans: ["full", "selfHosted"] },
      { name: "Exportera till SIE-fil", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "Fakturering",
    features: [
      { name: "Fakturagenerering", plans: ["full", "selfHosted"] },
      { name: "ROT/RUT-avdrag", plans: ["full", "selfHosted"] },
      { name: "Peppol e-faktura", plans: ["full", "selfHosted"] },
      { name: "Vinstmarginalbeskattning", plans: ["full", "selfHosted"] },
      { name: "Påminnelser", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "Lönehantering",
    features: [
      { name: "Löneberäkning", plans: ["full", "selfHosted"] },
      { name: "Arbetsgivardeklaration (AGI)", plans: ["full", "selfHosted"] },
      { name: "Lönebesked", plans: ["full", "selfHosted"] },
      { name: "Skattetabeller", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "Bank & transaktioner",
    features: [
      { name: "Bankimport (CSV, OFX, SIE)", plans: ["full", "selfHosted"] },
      { name: "Dubblettdetektering", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "Rapporter",
    features: [
      { name: "Resultaträkning", plans: ["full", "selfHosted"] },
      { name: "Balansräkning", plans: ["full", "selfHosted"] },
      { name: "Momsrapport", plans: ["full", "selfHosted"] },
      { name: "Bokslut (K1/K2/K3)", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "AI & automation",
    features: [
      { name: "AI-assisterad bokföring", plans: ["full", "selfHosted"] },
      { name: "Kvittoanalys", plans: ["full", "selfHosted"] },
      { name: "Email-inbox", plans: ["full", "selfHosted"] },
    ],
  },
  {
    name: "Team & samarbete",
    features: [
      { name: "Bjud in teammedlemmar", plans: ["verification", "full", "selfHosted"] },
      { name: "Arbetsytor", plans: ["verification", "full", "selfHosted"] },
    ],
  },
  {
    name: "Support & underhåll",
    features: [
      { name: "Teknisk support", plans: ["verification", "full"] },
      { name: "Automatiska säkerhetskopior", plans: ["verification", "full"] },
      { name: "Uppdateringar ingår", plans: ["verification", "full"] },
    ],
  },
  {
    name: "Self-hosted",
    features: [
      { name: "Full kontroll över data", plans: ["selfHosted"] },
      { name: "Anpassningsbar", plans: ["selfHosted"] },
      { name: "Öppen källkod (MIT)", plans: ["selfHosted"] },
    ],
  },
];

const plans = [
  { id: "verification" as const, name: "Kvitty Lite", price: "Gratis" },
  { id: "full" as const, name: "Kvitty Online", price: "Gratis (49 kr/mån)", recommended: true },
  { id: "selfHosted" as const, name: "Self-hosted", price: "Gratis" },
];

function FeatureCheck({ included }: { included: boolean }) {
  if (included) {
    return (
      <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <Check weight="bold" className="size-3.5 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  return (
    <div className="size-6 rounded-full bg-muted flex items-center justify-center">
      <X weight="bold" className="size-3.5 text-muted-foreground/50" />
    </div>
  );
}

export function FeaturesTable() {
  return (
    <div className="w-full">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr>
              <th className="text-left p-4 bg-muted/50 rounded-tl-xl font-medium text-sm text-muted-foreground w-[40%]">
                Funktion
              </th>
              {plans.map((plan, index) => (
                <th
                  key={plan.id}
                  className={`p-4 bg-muted/50 text-center ${index === plans.length - 1 ? "rounded-tr-xl" : ""}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{plan.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.price}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {/* Body */}
          <tbody>
            {featureCategories.map((category, categoryIndex) => (
              <Fragment key={`category-${category.name}`}>
                {/* Category header */}
                <tr>
                  <td
                    colSpan={4}
                    className={`p-4 bg-muted/30 font-medium text-sm ${categoryIndex === 0 ? "" : "border-t border-border"}`}
                  >
                    {category.name}
                  </td>
                </tr>
                {/* Features */}
                {category.features.map((feature, featureIndex) => (
                  <tr
                    key={`${category.name}-${feature.name}`}
                    className={featureIndex % 2 === 0 ? "bg-card" : "bg-card/50"}
                  >
                    <td className="p-4 text-sm">{feature.name}</td>
                    {plans.map((plan) => (
                      <td key={`${feature.name}-${plan.id}`} className="p-4 text-center">
                        <div className="flex justify-center">
                          <FeatureCheck included={feature.plans.includes(plan.id)} />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className="ring-1 ring-border rounded-xl p-5 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{plan.name}</h3>
                  {plan.recommended && (
                    <Badge variant="default" className="text-xs">
                      Rekommenderas
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.price}</p>
              </div>
            </div>
            <div className="space-y-4">
              {featureCategories.map((category) => {
                const includedFeatures = category.features.filter((f) =>
                  f.plans.includes(plan.id)
                );
                if (includedFeatures.length === 0) return null;
                return (
                  <div key={category.name}>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      {category.name}
                    </p>
                    <ul className="space-y-1.5">
                      {includedFeatures.map((feature) => (
                        <li
                          key={feature.name}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check weight="bold" className="size-4 text-green-600 shrink-0" />
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
