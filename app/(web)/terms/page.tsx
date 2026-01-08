import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/web/legal/legal-page-layout";
import { LegalSection } from "@/components/web/legal/legal-section";
import { LegalContactBox } from "@/components/web/legal/legal-contact-box";

export const metadata: Metadata = {
  title: "Användarvillkor — Kvitty",
  description: "Kvittys användarvillkor beskriver regler och ansvar vid användning av tjänsten.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Användarvillkor"
      lastUpdated="4 januari 2026"
      description="Dessa användarvillkor reglerar din användning av Kvitty och beskriver vårt ansvar och ditt ansvar som användare."
    >
      {/* Introduktion */}
      <LegalSection id="introduktion" title="1. Introduktion och acceptans">
        <p>
          Välkommen till Kvitty! Dessa användarvillkor ("Villkoren") utgör ett juridiskt bindande
          avtal mellan dig och RIBBAN AB (org.nr 559254-0321) ("vi", "oss", "vår").
        </p>
        <p>
          Genom att använda Kvitty accepterar du dessa Villkor. Om du inte accepterar Villkoren ska
          du inte använda tjänsten.
        </p>
        <p className="font-medium text-foreground">
          Senast uppdaterad: 4 januari 2026
        </p>
      </LegalSection>

      {/* Tjänstebeskrivning */}
      <LegalSection id="tjanstebeskrivning" title="2. Tjänstebeskrivning">
        <p>
          Kvitty är en bokförings- och faktureringslösning för små företag i Sverige. Vi erbjuder
          tjänsten i två varianter:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">2.1 Kvitty Online (Hosted SaaS)</h3>
            <p>
              En molnbaserad tjänst som vi driftar och underhåller. Tillgänglig via prenumeration.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">2.2 Self-hosted (Öppen källkod)</h3>
            <p>
              Kvittys källkod är tillgänglig under MIT-licens på GitHub. Du kan installera och drifta
              Kvitty på din egen infrastruktur. För self-hosted installation ansvarar du själv för
              drift, säkerhet och underhåll.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">2.3 Funktioner</h3>
            <p>Kvitty erbjuder två lägen:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Enkelt läge:</strong> Kvittohantering och grundläggande verifikationer</li>
              <li><strong className="text-foreground">Fullständig bokföring:</strong> Dubbelsidig bokföring, fakturering, lönehantering och generering av arbetsgivardeklarationer</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* Konto och åtkomst */}
      <LegalSection id="konto" title="3. Konto och åtkomst">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">3.1 Behörighet</h3>
            <p>
              För att använda Kvitty måste du vara minst 18 år gammal eller företräda ett företag
              eller annan juridisk person med rätt att ingå bindande avtal.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.2 Kontoskapande</h3>
            <p>
              För att använda Kvitty Online måste du skapa ett konto genom att ange en giltig
              e-postadress. Du kan logga in via:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-post med engångskod (OTP)</li>
              <li>Google OAuth (valfritt)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.3 Arbetsytor</h3>
            <p>
              Du kan skapa och hantera flera arbetsytor. Varje arbetsyta representerar ett företag
              eller en bokföringsenhet. Du kan bjuda in andra användare till dina arbetsytor.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.4 Kontosäkerhet</h3>
            <p>
              Du ansvarar för all aktivitet som sker under ditt konto. Skydda dina inloggningsuppgifter
              och meddela oss omedelbart om obehörig användning.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Användaransvar */}
      <LegalSection id="användaransvar" title="4. Användaransvar">
        <p className="font-medium text-foreground text-lg">
          Som användare av Kvitty har du följande ansvar:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">4.1 Säkerhet</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Skydda dina kontoinloggningsuppgifter</li>
              <li>Hantera åtkomst till arbetsytor noggrant</li>
              <li>Granska och ta bort åtkomst för användare som inte längre behöver den</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">4.2 Verifiering av bokföringsdata</h3>
            <p className="font-medium text-foreground bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              ⚠️ KRITISKT: Du är ensam ansvarig för att verifiera ALLA bokföringsposter, beräkningar
              och utdata från Kvitty. Du MÅSTE granska och verifiera:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Alla verifikationer och journalposter</li>
              <li>Alla skatteberäkningar och momsberäkningar</li>
              <li>Alla löneberäkningar och skatteavdrag</li>
              <li>Alla XML-filer för arbetsgivardeklarationer innan inlämning till Skatteverket</li>
              <li>Alla SIE-exporter och rapporter</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">4.3 Säkerhetskopior</h3>
            <p>
              Du MÅSTE behålla egna säkerhetskopior av din bokföringsdata (exempelvis genom regelbunden
              export av SIE-filer). Vi ansvarar inte för dataförlust.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">4.4 Efterlevnad av lagar</h3>
            <p>
              Du ansvarar för att din användning av Kvitty följer gällande lagar, inklusive:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bokföringslagen (SFS 1999:1078)</li>
              <li>Skattelagstiftning och Skatteverkets krav</li>
              <li>Momslagstiftning</li>
              <li>Arbetsmiljölagstiftning och kollektivavtal (för lönehantering)</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* Tjänsteleverans */}
      <LegalSection id="tjansteleveras" title="5. Tjänsteleverans">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">5.1 Tillgänglighet</h3>
            <p>
              Vi strävar efter att hålla Kvitty Online tillgängligt, men garanterar inte 100% drifttid.
              Tjänsten kan vara otillgänglig vid underhåll, uppgraderingar eller på grund av tekniska
              problem.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">5.2 Underhåll</h3>
            <p>
              Vi förbehåller oss rätten att tillfälligt stänga ner tjänsten för underhåll. Vi kommer
              att sträva efter att meddela planerat underhåll i förväg.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">5.3 Funktionsändringar</h3>
            <p>
              Vi kan när som helst lägga till, ändra eller ta bort funktioner i Kvitty. Väsentliga
              ändringar kommer att kommuniceras till användare.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">5.4 Support</h3>
            <p>
              Support erbjuds via e-post (hej@kvitty.se) och GitHub Issues. Vi garanterar ingen
              specifik svarstid för gratisanvändare.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* ANSVARSBEGRÄNSNINGAR - MYCKET VIKTIGT */}
      <LegalSection id="ansvar" title="6. ⚠️ ANSVARSBEGRÄNSNINGAR OCH FRISKRIVNINGAR">
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 p-6 rounded-lg space-y-4">
          <p className="font-bold text-foreground text-lg">
            LÄSA DETTA AVSNITT NOGGRANT. DET INNEHÅLLER VIKTIGA BEGRÄNSNINGAR AV VÅRT ANSVAR.
          </p>

          <div>
            <h3 className="font-bold text-foreground mb-2">6.1 "AS IS" - INGA GARANTIER</h3>
            <p>
              Kvitty tillhandahålls <strong>"I BEFINTLIGT SKICK"</strong> och{" "}
              <strong>"SOM TILLGÄNGLIG"</strong> utan garantier av något slag, varken uttryckliga
              eller underförstådda, inklusive men inte begränsat till:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Garantier om funktionalitet, tillförlitlighet eller prestanda</li>
              <li>Garantier om att tjänsten är fri från fel, buggar eller virus</li>
              <li>Garantier om noggrannhet, fullständighet eller korrekthet av data</li>
              <li>Garantier om lämplighet för ett visst ändamål</li>
              <li><strong className="text-foreground">INGA GARANTIER FÖR BOKFÖRINGSNOGGRANNHET</strong></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">6.2 ANVÄNDARVERIFIERING KRÄVS</h3>
            <p className="font-medium text-foreground">
              Programvaran kan innehålla fel, buggar eller felaktigheter. Du MÅSTE verifiera:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>ALLA bokföringsposter och verifikationer</li>
              <li>ALLA skatteberäkningar och momsberäkningar</li>
              <li>ALLA löneberäkningar och skatteavdrag</li>
              <li>ALLA XML-filer för arbetsgivardeklarationer innan inlämning till Skatteverket</li>
              <li>ALLA rapporter och SIE-exporter</li>
            </ul>
            <p className="mt-2 font-medium text-foreground">
              Vi garanterar INTE att utdata från Kvitty överensstämmer med Skatteverkets krav eller
              svensk bokföringslagstiftning. Det är DITT ansvar att säkerställa korrekthet.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">6.3 ANSVARSBEGRÄNSNING</h3>
            <p>
              I den utsträckning som tillåts enligt lag begränsar vi vårt ansvar enligt följande:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">Indirekta skador:</strong> Vi ansvarar INTE för
                indirekta skador, följdskador, förlorad vinst, förlorade intäkter, förlust av goodwill,
                förlust av data eller andra ekonomiska förluster.
              </li>
              <li>
                <strong className="text-foreground">Ansvarsbegränsning:</strong> Vårt maximala ansvar
                för direkta skador är begränsat till 0,5 prisbasbelopp (cirka 28 000 SEK för 2024),
                såvida inte tvingande lag kräver annat.
              </li>
              <li>
                <strong className="text-foreground">Tredjepartstjänster:</strong> Vi ansvarar INTE för
                fel, avbrott eller dataförlust orsakade av Google OAuth, Vercel, databas-leverantörer,
                Groq eller andra tredjepartstjänster.
              </li>
              <li>
                <strong className="text-foreground">Dataförlust:</strong> Vi ansvarar INTE för dataförlust.
                Du MÅSTE behålla egna säkerhetskopior.
              </li>
              <li>
                <strong className="text-foreground">Skattepåföljder:</strong> Vi ansvarar INTE för
                skattepåföljder, böter eller sanktioner från Skatteverket eller andra myndigheter som
                följer av felaktiga beräkningar eller inlämningar.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">6.4 ÖPPEN KÄLLKOD - COMMUNITY-BIDRAG</h3>
            <p>
              Kvitty är öppen källkod under MIT-licens. Mjukvaran kan innehålla bidrag från
              community som vi inte har full kontroll över. Detta kan påverka stabiliteten.
            </p>
            <p className="mt-2">
              Om du använder self-hosted version av Kvitty accepterar du ALLA risker förknippade med
              installation, drift, säkerhet och underhåll.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">6.5 INTERNET OCH TEKNIK</h3>
            <p>
              Vi ansvarar INTE för problem orsakade av internetanslutning, webbläsarkompatibilitet,
              eller andra tekniska faktorer utanför vår kontroll.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Immateriella rättigheter */}
      <LegalSection id="ip" title="7. Immateriella rättigheter">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">7.1 Kvitty varumärke</h3>
            <p>
              Varumärket "Kvitty" och relaterade logotyper ägs av RIBBAN AB. Du får inte använda
              dessa utan vårt skriftliga tillstånd.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">7.2 Öppen källkod</h3>
            <p>
              Kvittys källkod är licensierad under MIT-licens. Se LICENSE-filen i GitHub-repot för
              fullständiga villkor.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">7.3 Dina data</h3>
            <p>
              Du behåller alla rättigheter till data du lägger in i Kvitty (fakturor, kunder, bokföring, etc.).
              Genom att använda tjänsten ger du oss licens att behandla denna data för att tillhandahålla
              tjänsten.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Data och integritet */}
      <LegalSection id="data-integritet" title="8. Data och integritet">
        <p>
          Vår hantering av personuppgifter och datasäkerhet beskrivs i:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/privacy"
              className="text-foreground hover:text-foreground/80 underline underline-offset-2"
            >
              Integritetspolicy
            </Link>
            {" "}— Hur vi behandlar personuppgifter
          </li>
          <li>
            <Link
              href="/datasecurity"
              className="text-foreground hover:text-foreground/80 underline underline-offset-2"
            >
              Datasäkerhetspolicy
            </Link>
            {" "}— Våra säkerhetsåtgärder
          </li>
        </ul>
        <div className="mt-4 space-y-2">
          <p>
            <strong className="text-foreground">Dataportabilitet:</strong> Du kan när som helst exportera
            dina bokföringsdata som SIE-fil.
          </p>
          <p>
            <strong className="text-foreground">Dataradering:</strong> Om du avslutar ditt konto raderar
            vi dina personuppgifter, med undantag för uppgifter vi är skyldiga att bevara enligt lag
            (bokföringsdata i 7 år enligt Bokföringslagen).
          </p>
        </div>
      </LegalSection>

      {/* Prissättning */}
      <LegalSection id="prissattning" title="9. Prissättning och betalning">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">9.1 Priser</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Gratis nivå:</strong> Kvitty Online (enkelt läge) — kostnadsfritt</li>
              <li><strong className="text-foreground">Betald nivå:</strong> Kvitty Online (fullständig bokföring) — från 49 kr/mån exkl. moms</li>
              <li><strong className="text-foreground">Self-hosted:</strong> Gratis (du ansvarar för egen infrastruktur)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">9.2 Prisändringar</h3>
            <p>
              Vi förbehåller oss rätten att ändra priser med 30 dagars varsel via e-post.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">9.3 Betalning</h3>
            <p>
              Betalning sker månadsvis i förskott via tredjepartsbetalningsleverantör. Priser anges
              exklusive moms.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">9.4 Inga återbetalningar</h3>
            <p>
              Vi erbjuder inga återbetalningar för redan betalda perioder. Du kan avsluta din
              prenumeration när som helst för att undvika framtida debiteringar.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Uppsägning */}
      <LegalSection id="uppsagning" title="10. Avstängning och uppsägning">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">10.1 Din rätt att säga upp</h3>
            <p>
              Du kan när som helst avsluta ditt konto och säga upp tjänsten. Exportera dina data innan
              du avslutar kontot.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">10.2 Vår rätt att stänga av</h3>
            <p>
              Vi kan stänga av eller avsluta ditt konto om du:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bryter mot dessa Villkor</li>
              <li>Använder tjänsten på ett olagligt eller skadligt sätt</li>
              <li>Inte betalar för betalda tjänster</li>
              <li>Missbrukar tjänsten eller skadar andra användare</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">10.3 Dataexport före uppsägning</h3>
            <p>
              Vi rekommenderar starkt att du exporterar alla dina data (SIE-filer, PDF-fakturor, etc.)
              innan du avslutar ditt konto.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">10.4 Datalagring efter uppsägning</h3>
            <p>
              Bokföringsdata som vi är skyldiga att bevara enligt Bokföringslagen (7 år) kommer att
              behållas även efter kontoavslutning.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Tillämplig lag */}
      <LegalSection id="lag" title="11. Tillämplig lag och tvister">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">11.1 Svensk lag</h3>
            <p>
              Dessa Villkor ska tolkas och tillämpas i enlighet med svensk lag.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">11.2 Tvistelösning</h3>
            <p>
              Tvister ska avgöras av svensk domstol med Stockholm som första instans.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">11.3 Konsumentskydd</h3>
            <p>
              Om du är konsument gäller svenska konsumentskyddslagar oavsett vad som står i dessa
              Villkor.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Tredjepartstjänster */}
      <LegalSection id="tredjeparter" title="12. Tredjepartstjänster">
        <p>
          Kvitty integrerar med tredjepartstjänster. För dessa tjänster gäller respektive leverantörs
          villkor:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-foreground">Google OAuth:</strong> Om du loggar in med Google
            gäller Googles användarvillkor och integritetspolicy
          </li>
          <li>
            <strong className="text-foreground">Vercel:</strong> Hosting och infrastruktur tillhandahålls
            av Vercel Inc.
          </li>
          <li>
            <strong className="text-foreground">Groq:</strong> AI-funktioner tillhandahålls av Groq
          </li>
        </ul>
        <p className="mt-4">
          Vi har ingen kontroll över dessa tredjepartstjänsters tillgänglighet, funktionalitet eller
          säkerhet. Vi ansvarar inte för fel, avbrott eller dataförlust orsakade av tredjepartsleverantörer.
        </p>
      </LegalSection>

      {/* Ändringar */}
      <LegalSection id="andringar-villkor" title="13. Ändringar av användarvillkoren">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">13.1 Rätt att ändra</h3>
            <p>
              Vi förbehåller oss rätten att när som helst ändra dessa Villkor.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">13.2 Notifiering</h3>
            <p>
              Väsentliga ändringar kommer att meddelas via e-post minst 30 dagar innan de träder i kraft.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">13.3 Acceptans</h3>
            <p>
              Fortsatt användning av Kvitty efter att ändringar trätt i kraft utgör acceptans av de
              nya villkoren.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Kontakt */}
      <LegalSection id="kontakt-support" title="14. Kontakt och support">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">14.1 Support</h3>
            <p>
              För support och tekniska frågor:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                E-post:{" "}
                <a
                  href="mailto:hej@kvitty.se"
                  className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                >
                  hej@kvitty.se
                </a>
              </li>
              <li>
                GitHub Issues:{" "}
                <a
                  href="https://github.com/sajn-se/kvitty-app/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-foreground/80 underline underline-offset-2"
                >
                  github.com/sajn-se/kvitty-app/issues
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">14.2 Svarstid</h3>
            <p>
              Vi strävar efter att svara på support-förfrågningar inom rimlig tid, men garanterar ingen
              specifik svarstid för gratisanvändare.
            </p>
          </div>
        </div>
        <LegalContactBox />
      </LegalSection>

      {/* Övrigt */}
      <LegalSection id="ovrigt" title="15. Övrigt">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">15.1 Hela avtalet</h3>
            <p>
              Dessa Villkor tillsammans med vår Integritetspolicy och Datasäkerhetspolicy utgör hela
              avtalet mellan dig och RIBBAN AB.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">15.2 Delbarhet</h3>
            <p>
              Om någon del av dessa Villkor bedöms ogiltig eller omöjlig att verkställa, ska övriga
              delar fortsätta gälla.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">15.3 Ingen avstående från rättigheter</h3>
            <p>
              Vår underlåtenhet att verkställa någon rättighet enligt dessa Villkor utgör inte ett
              avstående från den rättigheten.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">15.4 Överlåtelse</h3>
            <p>
              Vi kan överlåta våra rättigheter och skyldigheter enligt dessa Villkor. Du får inte
              överlåta dina rättigheter utan vårt skriftliga samtycke.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">15.5 Force majeure</h3>
            <p>
              Vi ansvarar inte för förseningar eller fel orsakade av omständigheter utanför vår rimliga
              kontroll (naturkatastrofer, krig, cyberattacker, etc.).
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Relaterade dokument */}
      <LegalSection id="relaterade-dokument" title="16. Relaterade dokument">
        <p>Läs även:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Link
              href="/privacy"
              className="text-foreground hover:text-foreground/80 underline underline-offset-2"
            >
              Integritetspolicy
            </Link>
            {" "}— Hur vi behandlar personuppgifter
          </li>
          <li>
            <Link
              href="/datasecurity"
              className="text-foreground hover:text-foreground/80 underline underline-offset-2"
            >
              Datasäkerhetspolicy
            </Link>
            {" "}— Våra säkerhetsåtgärder
          </li>
          <li>
            <a
              href="https://github.com/sajn-se/kvitty-app/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-foreground/80 underline underline-offset-2"
            >
              MIT License
            </a>
            {" "}— Öppen källkods-licens
          </li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}
