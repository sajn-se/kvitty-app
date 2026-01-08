/**
 * Peppol BIS Billing 3.0 Invoice XML Generator
 *
 * Generates UBL 2.1 compliant XML invoices according to the Peppol BIS Billing 3.0 specification.
 * Reference: https://docs.peppol.eu/poacc/billing/3.0/
 */

import type { Invoice, InvoiceLine, Customer, Workspace } from "@/lib/db/schema";

interface PeppolInvoiceData {
  workspace: Pick<
    Workspace,
    | "id"
    | "name"
    | "orgName"
    | "orgNumber"
    | "address"
    | "postalCode"
    | "city"
    | "contactName"
    | "contactEmail"
    | "contactPhone"
    | "bankgiro"
    | "plusgiro"
    | "iban"
    | "bic"
    | "vatNumber"
  >;
  invoice: Invoice;
  customer: Customer;
  lines: InvoiceLine[];
}

/**
 * Generate Peppol BIS Billing 3.0 XML invoice
 */
export function generatePeppolXML(data: PeppolInvoiceData): string {
  const { workspace, invoice, customer, lines } = data;

  const issueDate = invoice.invoiceDate;
  const dueDate = invoice.dueDate;
  const invoiceNumber = invoice.invoiceNumber.toString();

  // Calculate tax subtotals by rate
  const taxSubtotals = calculateTaxSubtotals(lines, invoice.isReverseCharge);

  // Determine tax category based on invoice type
  const taxCategoryId = invoice.isReverseCharge ? "AE" : "S"; // AE = Reverse charge, S = Standard rate

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoiceNumber)}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>SEK</cbc:DocumentCurrencyCode>
  ${invoice.ocrNumber ? `<cbc:PaymentID>${escapeXml(invoice.ocrNumber)}</cbc:PaymentID>` : ""}
  ${invoice.reference ? `<cbc:BuyerReference>${escapeXml(invoice.reference)}</cbc:BuyerReference>` : ""}

  <!-- Seller (AccountingSupplierParty) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0007">${escapeXml(workspace.orgNumber || "")}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="0007">${escapeXml(workspace.orgNumber || "")}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(workspace.orgName || workspace.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(workspace.address || "")}</cbc:StreetName>
        <cbc:CityName>${escapeXml(workspace.city || "")}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(workspace.postalCode || "")}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SE</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${
        workspace.vatNumber
          ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(workspace.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(workspace.orgName || workspace.name)}</cbc:RegistrationName>
        <cbc:CompanyID schemeID="0007">${escapeXml(workspace.orgNumber || "")}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      ${
        workspace.contactName || workspace.contactEmail || workspace.contactPhone
          ? `<cac:Contact>
        ${workspace.contactName ? `<cbc:Name>${escapeXml(workspace.contactName)}</cbc:Name>` : ""}
        ${workspace.contactPhone ? `<cbc:Telephone>${escapeXml(workspace.contactPhone)}</cbc:Telephone>` : ""}
        ${workspace.contactEmail ? `<cbc:ElectronicMail>${escapeXml(workspace.contactEmail)}</cbc:ElectronicMail>` : ""}
      </cac:Contact>`
          : ""
      }
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Buyer (AccountingCustomerParty) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0007">${escapeXml(customer.einvoiceAddress || customer.orgNumber || "")}</cbc:EndpointID>
      <cac:PartyIdentification>
        <cbc:ID schemeID="0007">${escapeXml(customer.orgNumber || "")}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escapeXml(customer.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(customer.address || "")}</cbc:StreetName>
        <cbc:CityName>${escapeXml(customer.city || "")}</cbc:CityName>
        <cbc:PostalZone>${escapeXml(customer.postalCode || "")}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${customer.countryCode || "SE"}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${
        customer.vatNumber
          ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(customer.vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>`
          : ""
      }
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(customer.name)}</cbc:RegistrationName>
        ${customer.orgNumber ? `<cbc:CompanyID schemeID="0007">${escapeXml(customer.orgNumber)}</cbc:CompanyID>` : ""}
      </cac:PartyLegalEntity>
      ${
        customer.email
          ? `<cac:Contact>
        <cbc:ElectronicMail>${escapeXml(customer.email)}</cbc:ElectronicMail>
      </cac:Contact>`
          : ""
      }
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Payment Means -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    ${invoice.ocrNumber ? `<cbc:PaymentID>${escapeXml(invoice.ocrNumber)}</cbc:PaymentID>` : ""}
    ${
      workspace.bankgiro
        ? `<cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXml(workspace.bankgiro.replace(/\D/g, ""))}</cbc:ID>
      <cbc:Name>Bankgiro</cbc:Name>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>BGABSESS</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>`
        : workspace.iban
          ? `<cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXml(workspace.iban.replace(/\s/g, ""))}</cbc:ID>
      ${
        workspace.bic
          ? `<cac:FinancialInstitutionBranch>
        <cbc:ID>${escapeXml(workspace.bic)}</cbc:ID>
      </cac:FinancialInstitutionBranch>`
          : ""
      }
    </cac:PayeeFinancialAccount>`
          : ""
    }
  </cac:PaymentMeans>

  <!-- Payment Terms -->
  <cac:PaymentTerms>
    <cbc:Note>Betalningsvillkor: ${invoice.paymentTermsDays || 30} dagar netto</cbc:Note>
  </cac:PaymentTerms>

  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SEK">${parseFloat(invoice.vatAmount).toFixed(2)}</cbc:TaxAmount>
    ${taxSubtotals
      .map(
        (ts) => `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="SEK">${ts.taxableAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="SEK">${ts.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${taxCategoryId}</cbc:ID>
        <cbc:Percent>${ts.percent}</cbc:Percent>
        ${invoice.isReverseCharge ? "<cbc:TaxExemptionReason>Omvänd skattskyldighet</cbc:TaxExemptionReason>" : ""}
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`
      )
      .join("")}
  </cac:TaxTotal>

  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="SEK">${parseFloat(invoice.subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="SEK">${parseFloat(invoice.subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="SEK">${parseFloat(invoice.total).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="SEK">${parseFloat(invoice.total).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Lines -->
  ${lines
    .filter((l) => l.lineType !== "text")
    .map(
      (line, idx) => `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${mapUnit(line.unit || "styck")}">${parseFloat(line.quantity).toFixed(2)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="SEK">${parseFloat(line.amount).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(line.description)}</cbc:Description>
      <cbc:Name>${escapeXml(line.description.slice(0, 50))}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${taxCategoryId}</cbc:ID>
        <cbc:Percent>${invoice.isReverseCharge ? 0 : line.vatRate}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="SEK">${parseFloat(line.unitPrice).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
    )
    .join("")}
</Invoice>`;

  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Map Swedish unit names to UN/CEFACT codes
 */
function mapUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    styck: "C62",     // One (piece)
    st: "C62",
    timmar: "HUR",    // Hour
    timme: "HUR",
    tim: "HUR",
    dagar: "DAY",     // Day
    dag: "DAY",
    manader: "MON",   // Month
    manad: "MON",
    kilogram: "KGM",  // Kilogram
    kg: "KGM",
    gram: "GRM",      // Gram
    g: "GRM",
    liter: "LTR",     // Litre
    l: "LTR",
    meter: "MTR",     // Metre
    m: "MTR",
    m2: "MTK",        // Square metre
    kvm: "MTK",
    m3: "MTQ",        // Cubic metre
    kubikmeter: "MTQ",
    paket: "PK",      // Package
    forpackning: "PK",
    kartong: "CT",    // Carton
    pall: "PF",       // Pallet
  };
  return unitMap[unit.toLowerCase()] || "C62"; // Default to piece
}

interface TaxSubtotal {
  percent: number;
  taxableAmount: number;
  taxAmount: number;
}

/**
 * Calculate tax subtotals grouped by VAT rate
 */
function calculateTaxSubtotals(lines: InvoiceLine[], isReverseCharge: boolean): TaxSubtotal[] {
  const subtotals = new Map<number, TaxSubtotal>();

  for (const line of lines) {
    if (line.lineType === "text") continue;

    const amount = parseFloat(line.amount);
    const effectiveVatRate = isReverseCharge ? 0 : line.vatRate;
    const vatAmount = isReverseCharge ? 0 : amount * (line.vatRate / 100);

    const existing = subtotals.get(effectiveVatRate);
    if (existing) {
      existing.taxableAmount += amount;
      existing.taxAmount += vatAmount;
    } else {
      subtotals.set(effectiveVatRate, {
        percent: effectiveVatRate,
        taxableAmount: amount,
        taxAmount: vatAmount,
      });
    }
  }

  // Ensure at least one tax subtotal exists
  if (subtotals.size === 0) {
    subtotals.set(0, { percent: 0, taxableAmount: 0, taxAmount: 0 });
  }

  return Array.from(subtotals.values());
}

/**
 * Validate that all required fields are present for Peppol invoice
 */
export function validatePeppolInvoice(data: PeppolInvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Seller validation
  if (!data.workspace.orgNumber) {
    errors.push("Säljaren saknar organisationsnummer");
  }
  if (!data.workspace.orgName && !data.workspace.name) {
    errors.push("Säljaren saknar företagsnamn");
  }

  // Buyer validation
  if (!data.customer.name) {
    errors.push("Köparen saknar namn");
  }
  if (!data.customer.einvoiceAddress && !data.customer.orgNumber) {
    errors.push("Köparen saknar e-fakturaadress (Peppol-ID) eller organisationsnummer");
  }

  // Invoice validation
  if (!data.invoice.invoiceNumber) {
    errors.push("Fakturan saknar fakturanummer");
  }
  if (!data.invoice.invoiceDate) {
    errors.push("Fakturan saknar fakturadatum");
  }
  if (!data.invoice.dueDate) {
    errors.push("Fakturan saknar förfallodatum");
  }

  // Line validation
  const productLines = data.lines.filter((l) => l.lineType !== "text");
  if (productLines.length === 0) {
    errors.push("Fakturan saknar fakturarader");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
