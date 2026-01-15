import {
  CurrencyCircleDollar,
  Sparkle,
  Code,
} from "@phosphor-icons/react/dist/ssr";

const highlights = [
  {
    icon: CurrencyCircleDollar,
    title: "Billigare än konkurrenterna",
    description:
      "Kvitty Online kostar normalt 49 kr/mån, men är helt gratis så länge vi är i testfas. Jämfört med Bokios 249 kr/mån är det ett fantastiskt pris.",
    kvitty: "Gratis (49 kr/mån)",
    bokio: "249–599 kr/mån",
  },
  {
    icon: Sparkle,
    title: "Enklare att använda",
    description:
      "Kvitty är byggt för enkelhet. Ingen överflödig komplexitet – bara de funktioner du faktiskt behöver för att sköta din bokföring.",
    kvitty: "Fokuserat gränssnitt",
    bokio: "Mer funktioner, mer komplexitet",
  },
  {
    icon: Code,
    title: "Öppen källkod",
    description:
      "Kvitty är helt öppen källkod med MIT-licens. Du kan granska koden, bidra till utvecklingen, eller hosta på din egen server helt gratis.",
    kvitty: "MIT-licens, self-hosting",
    bokio: "Proprietär mjukvara",
  },
];

export function HighlightCards() {
  return (
    <section className="px-5 sm:px-[5%] pb-16 sm:pb-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="ring-1 ring-border rounded-2xl p-6 sm:p-8 bg-card"
            >
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-5">
                <item.icon weight="duotone" className="size-6 text-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {item.description}
              </p>
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kvitty</span>
                  <span className="font-medium text-green-600">{item.kvitty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bokio</span>
                  <span className="text-foreground">{item.bokio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
