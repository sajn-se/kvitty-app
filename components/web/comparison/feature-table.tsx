import { Check, X } from "@phosphor-icons/react/dist/ssr";

type Feature = {
  name: string;
  kvitty: boolean | string;
  bokio: boolean | string;
};

const pricingFeatures: Feature[] = [
  { name: "Grundpris", kvitty: "Gratis (49 kr/mån)", bokio: "249 kr/mån" },
  { name: "Full bokföring", kvitty: "Gratis (49 kr/mån)", bokio: "249 kr/mån" },
  { name: "Self-hosted", kvitty: "0 kr/mån", bokio: "-" },
];

const coreFeatures: Feature[] = [
  { name: "Kvittohantering", kvitty: true, bokio: true },
  { name: "Verifikationer", kvitty: true, bokio: true },
  { name: "BAS-kontoplan", kvitty: true, bokio: true },
  { name: "Huvudbok", kvitty: true, bokio: true },
  { name: "Balansräkning", kvitty: true, bokio: true },
  { name: "SIE-export", kvitty: true, bokio: true },
  { name: "Teammedlemmar", kvitty: true, bokio: true },
];

const advancedFeatures: Feature[] = [
  { name: "Fakturering", kvitty: true, bokio: true },
  { name: "Lönehantering", kvitty: true, bokio: true },
  { name: "Bankintegration", kvitty: true, bokio: true },
  { name: "Momsdeklaration", kvitty: true, bokio: true },
  { name: "Årsredovisning", kvitty: true, bokio: true },
  { name: "ROT/RUT-avdrag", kvitty: true, bokio: true },
  { name: "Peppol e-faktura", kvitty: true, bokio: true },
  { name: "Vinstmarginalbeskattning", kvitty: true, bokio: false },
  { name: "AI-assisterad bokföring", kvitty: true, bokio: false },
  { name: "Email-inbox", kvitty: true, bokio: false },
];

const flexibilityFeatures: Feature[] = [
  { name: "Öppen källkod", kvitty: true, bokio: false },
  { name: "Self-hosting möjligt", kvitty: true, bokio: false },
  { name: "API-åtkomst", kvitty: true, bokio: true },
  { name: "Ingen bindningstid", kvitty: true, bokio: true },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="font-medium">{value}</span>;
  }
  if (value) {
    return <Check weight="bold" className="size-5 text-green-600 inline" />;
  }
  return <X weight="bold" className="size-5 text-muted-foreground/40 inline" />;
}

function FeatureColumn({
  features,
  service,
}: {
  features: { title: string; items: Feature[] }[];
  service: "kvitty" | "bokio";
}) {
  return (
    <table className="w-full">
      <tbody>
        {features.map((section, sectionIdx) => (
          <>
            <tr key={`${section.title}-header`}>
              <td
                colSpan={2}
                className={`pb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide ${sectionIdx === 0 ? "pt-6" : "pt-8"}`}
              >
                {section.title}
              </td>
            </tr>
            {section.items.map((f, idx) => (
              <tr
                key={f.name}
                className={
                  idx < section.items.length - 1 ? "border-b border-border" : ""
                }
              >
                <td className="py-3.5 text-sm text-muted-foreground w-1/2">
                  {f.name}
                </td>
                <td className="py-3.5 text-sm font-medium text-right">
                  <FeatureValue value={f[service]} />
                </td>
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  );
}

const allFeatures = [
  { title: "Prissättning", items: pricingFeatures },
  { title: "Grundfunktioner", items: coreFeatures },
  { title: "Avancerade funktioner", items: advancedFeatures },
  { title: "Flexibilitet", items: flexibilityFeatures },
];

export function FeatureTable() {
  return (
    <section className="px-5 sm:px-[5%] pb-16 sm:pb-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-medium text-2xl sm:text-3xl tracking-tight mb-3">
            Funktionsjämförelse
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            En detaljerad översikt av vad respektive tjänst erbjuder.
          </p>
        </div>

        <div className="ring-1 ring-border rounded-2xl bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th
                    colSpan={2}
                    className="py-4 px-6 text-left text-base font-semibold border-r border-border w-1/2"
                  >
                    Kvitty
                  </th>
                  <th
                    colSpan={2}
                    className="py-4 px-6 text-left text-base font-semibold w-1/2"
                  >
                    Bokio
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 pb-6 border-r border-border align-top w-1/2"
                  >
                    <FeatureColumn features={allFeatures} service="kvitty" />
                  </td>
                  <td colSpan={2} className="px-6 pb-6 align-top w-1/2">
                    <FeatureColumn features={allFeatures} service="bokio" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
