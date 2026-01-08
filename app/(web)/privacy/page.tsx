import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/web/legal/legal-page-layout";
import { LegalSection } from "@/components/web/legal/legal-section";
import { LegalContactBox } from "@/components/web/legal/legal-contact-box";

export const metadata: Metadata = {
  title: "Integritetspolicy — Kvitty",
  description: "Kvittys integritetspolicy beskriver hur vi samlar in, använder och skyddar dina personuppgifter i enlighet med GDPR.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Integritetspolicy"
      lastUpdated="4 januari 2026"
      description="Denna integritetspolicy beskriver hur Kvitty samlar in, använder, lagrar och skyddar dina personuppgifter när du använder vår tjänst."
    >
      {/* Introduktion */}
      <LegalSection id="introduktion" title="1. Introduktion">
        <p>
          Vi på Kvitty tar din integritet på allvar. Denna integritetspolicy beskriver hur vi
          behandlar personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR) och svensk
          lagstiftning.
        </p>
        <p>
          Kvitty är en bokförings- och faktureringslösning för små företag i Sverige. Vi erbjuder
          både enkel kvittohantering och fullständig bokföring med lönehantering och generering av arbetsgivardeklarationer
          för svensk skattedeklaration.
        </p>
      </LegalSection>

      {/* Personuppgiftsansvarig */}
      <LegalSection id="personuppgiftsansvarig" title="2. Personuppgiftsansvarig">
        <p>
          Personuppgiftsansvarig för behandlingen av dina personuppgifter är:
        </p>
        <div className="pl-4 border-l-2 border-border">
          <p className="font-medium text-foreground">RIBBAN AB</p>
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
      </LegalSection>

      {/* Vilka personuppgifter vi behandlar */}
      <LegalSection id="personuppgifter" title="3. Vilka personuppgifter vi behandlar">
        <p>
          Vi behandlar följande kategorier av personuppgifter beroende på hur du använder Kvitty:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">3.1 Kontodata</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-postadress</li>
              <li>Namn</li>
              <li>Profilbild (om du använder Google OAuth)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.2 Autentiseringsdata</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sessionstokens</li>
              <li>IP-adress</li>
              <li>User agent (webbläsarinformation)</li>
              <li>OAuth-tokens (om du loggar in med Google)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.3 Arbetsytedata</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Företagets organisationsnummer</li>
              <li>Företagsnamn</li>
              <li>Kontaktuppgifter (telefon, e-post)</li>
              <li>Adress och postnummer</li>
              <li>Momsregistreringsnummer</li>
              <li>Bankkontonummer</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.4 Finansiell data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fakturor och fakturarader</li>
              <li>Kunduppgifter (namn, organisationsnummer, adress, e-post)</li>
              <li>Produkter och tjänster</li>
              <li>Verifikationer och journalposter</li>
              <li>Räkenskapsperioder</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.5 Lönedata</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Anställdas namn och personnummer</li>
              <li>Adressuppgifter</li>
              <li>Löneuppgifter och skatteinställningar</li>
              <li>Lönekörningar och beräkningar</li>
              <li>XML-filer för arbetsgivardeklarationer</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.6 Filuploads</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Kvitton och underlag</li>
              <li>Faktura-PDF:er</li>
              <li>Bilagor och dokument</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-foreground mb-2">3.7 Användningsdata</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Inloggningsloggar</li>
              <li>Aktivitetstidsstämplar</li>
              <li>Funktionsanvändning</li>
            </ul>
          </div>
        </div>
      </LegalSection>

      {/* Rättslig grund */}
      <LegalSection id="rattslig-grund" title="4. Rättslig grund för behandling">
        <p>
          Vi behandlar dina personuppgifter baserat på följande rättsliga grunder enligt GDPR:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">4.1 Avtalsuppfyllelse (Art. 6.1.b GDPR)</h3>
            <p>
              För att kunna tillhandahålla Kvitty-tjänsten och uppfylla vårt avtal med dig behöver vi
              behandla dina konto-, arbetsyte- och användningsdata.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">4.2 Berättigat intresse (Art. 6.1.f GDPR)</h3>
            <p>
              För att förbättra tjänsten, säkerställa säkerhet och förhindra missbruk har vi ett
              berättigat intresse att behandla viss autentiserings- och användningsdata.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">4.3 Rättsliga skyldigheter (Art. 6.1.c GDPR)</h3>
            <p>
              Vi är enligt svensk bokföringslag (Bokföringslagen, SFS 1999:1078) skyldiga att bevara
              viss finansiell data under specifika tidsperioder.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Lagringstid */}
      <LegalSection id="lagringstid" title="5. Hur länge vi lagrar dina uppgifter">
        <p>
          Vi lagrar dina personuppgifter endast så länge det är nödvändigt för de ändamål som anges
          i denna policy:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">5.1 Aktiva konton</h3>
            <p>
              Konto- och arbetsytedata lagras så länge du har ett aktivt konto hos oss.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">5.2 Bokföringsdata</h3>
            <p>
              Enligt Bokföringslagen (SFS 1999:1078) ska bokföringsmaterial bevaras i 7 år efter
              utgången av det kalenderår då räkenskapsåret avslutades. Detta inkluderar verifikationer,
              fakturor och löneunderlag.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">5.3 Rättsliga anspråk</h3>
            <p>
              Vissa uppgifter kan behöva bevaras upp till 10 år för att hantera eventuella rättsliga
              anspråk.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">5.4 Radering av konto</h3>
            <p>
              Om du begär radering av ditt konto kommer vi att radera dina personuppgifter, med undantag
              för uppgifter som vi är skyldiga att bevara enligt lag (se ovan).
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Mottagare */}
      <LegalSection id="mottagare" title="6. Mottagare av personuppgifter">
        <p>
          Vi delar dina personuppgifter med följande kategorier av mottagare:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">6.1 Hosting och infrastruktur</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vercel Inc. (hosting och CDN)</li>
              <li>PostgreSQL-databasleverantör</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">6.2 Fillagring</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Vercel Blob (filuppladdning och lagring)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">6.3 Autentisering</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Google LLC (när du använder Google OAuth-inloggning)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">6.4 E-posttjänster</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>E-postleverantör för autentisering och notifieringar</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">6.5 AI-tjänster</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Groq (för AI-funktioner i tjänsten)</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 font-medium text-foreground">
          Vi säljer aldrig dina personuppgifter till tredje part.
        </p>
      </LegalSection>

      {/* Internationella överföringar */}
      <LegalSection id="internationella-overforing" title="7. Internationella dataöverföringar">
        <p>
          Vi strävar efter att lagra dina personuppgifter inom EU/EES. I de fall personuppgifter
          överförs till länder utanför EU/EES säkerställer vi att:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Standardavtalsklausuler (Standard Contractual Clauses) enligt EU-kommissionens beslut används
          </li>
          <li>
            Mottagaren har vidtagit lämpliga tekniska och organisatoriska säkerhetsåtgärder
          </li>
          <li>
            Överföringen sker i enlighet med GDPR kapitel V
          </li>
        </ul>
      </LegalSection>

      {/* Dina rättigheter */}
      <LegalSection id="dina-rattigheter" title="8. Dina rättigheter enligt GDPR">
        <p>
          Du har följande rättigheter gällande dina personuppgifter:
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-foreground mb-2">8.1 Rätt till registerutdrag</h3>
            <p>
              Du har rätt att få information om vilka personuppgifter vi behandlar om dig.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">8.2 Rätt till rättelse</h3>
            <p>
              Du har rätt att begära rättelse av felaktiga eller ofullständiga personuppgifter.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">8.3 Rätt till radering</h3>
            <p>
              Du har rätt att begära radering av dina personuppgifter, med undantag för uppgifter vi
              är skyldiga att bevara enligt lag (exempelvis bokföringsdata i 7 år).
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">8.4 Rätt till dataportabilitet</h3>
            <p>
              Du har rätt att få ut dina personuppgifter i ett strukturerat, allmänt använt och
              maskinläsbart format (exempelvis SIE-fil för bokföringsdata).
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">8.5 Rätt att göra invändningar</h3>
            <p>
              Du har rätt att invända mot behandling av dina personuppgifter som baseras på berättigat
              intresse.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-2">8.6 Rätt att klaga</h3>
            <p>
              Du har rätt att lämna in klagomål till Integritetsskyddsmyndigheten (IMY) om du anser att
              vi behandlar dina personuppgifter i strid med gällande dataskyddsregler.
            </p>
            <p className="mt-2">
              <a
                href="https://www.imy.se"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-foreground/80 underline underline-offset-2"
              >
                www.imy.se
              </a>
            </p>
          </div>
        </div>
        <p className="mt-4">
          För att utöva dina rättigheter, kontakta oss på{" "}
          <a
            href="mailto:hej@kvitty.se"
            className="text-foreground hover:text-foreground/80 underline underline-offset-2"
          >
            hej@kvitty.se
          </a>
          .
        </p>
      </LegalSection>

      {/* Säkerhetsåtgärder */}
      <LegalSection id="sakerhetsatgarder" title="9. Säkerhetsåtgärder">
        <p>
          Vi vidtar lämpliga tekniska och organisatoriska säkerhetsåtgärder för att skydda dina
          personuppgifter mot obehörig åtkomst, förlust eller förstörelse.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-foreground">Kryptering:</strong> All data krypteras under överföring
            (TLS/SSL) och i vila (databaskryptering).
          </li>
          <li>
            <strong className="text-foreground">Åtkomstkontroll:</strong> Begränsad personalåtkomst med
            multifaktorautentisering och rollbaserad åtkomstkontroll.
          </li>
          <li>
            <strong className="text-foreground">Säkerhetskopiering:</strong> Regelbundna backuper för
            att säkerställa dataintegritet.
          </li>
          <li>
            <strong className="text-foreground">Säkerhetsövervakning:</strong> Kontinuerlig övervakning
            och loggning av säkerhetshändelser.
          </li>
        </ul>
        <p className="mt-4">
          För mer information om våra säkerhetsåtgärder, se vår{" "}
          <Link
            href="/datasecurity"
            className="text-foreground hover:text-foreground/80 underline underline-offset-2"
          >
            Datasäkerhetspolicy
          </Link>
          .
        </p>
      </LegalSection>

      {/* Cookies */}
      <LegalSection id="cookies" title="10. Cookies och spårning">
        <p>
          Kvitty använder för närvarande inga cookies för marknadsföring eller analys. Vi använder
          sessionshantering via better-auth för att hantera din inloggning och autentisering.
        </p>
        <p>
          Om vi i framtiden implementerar cookies kommer vi att uppdatera denna policy och informera
          dig om detta.
        </p>
      </LegalSection>

      {/* Kontakt */}
      <LegalSection id="kontakt" title="11. Kontaktinformation">
        <p>
          Om du har frågor om denna integritetspolicy eller hur vi behandlar dina personuppgifter,
          är du välkommen att kontakta oss.
        </p>
        <LegalContactBox />
      </LegalSection>

      {/* Ändringar */}
      <LegalSection id="andringar" title="12. Ändringar av integritetspolicyn">
        <p>
          Vi förbehåller oss rätten att uppdatera denna integritetspolicy. Väsentliga ändringar kommer
          att meddelas via e-post eller genom notis i tjänsten. Datumet för senaste uppdatering finns
          längst upp på denna sida.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
