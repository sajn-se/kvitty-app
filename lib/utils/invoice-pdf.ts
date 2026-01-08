import { jsPDF } from "jspdf";
import type { Invoice, InvoiceLine, Customer } from "@/lib/db/schema";
import { unitLabels } from "@/lib/validations/product";

// Partial workspace type for PDF generation - only includes fields actually used
interface WorkspaceForPdf {
  id: string;
  name: string;
  orgName?: string | null;
  orgNumber?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  // Payment info
  bankgiro?: string | null;
  plusgiro?: string | null;
  iban?: string | null;
  bic?: string | null;
  swishNumber?: string | null;
  invoiceNotes?: string | null;
  // Invoice settings defaults
  paymentTermsDays?: number | null;
  latePaymentInterest?: string | null;
  // VAT compliance
  vatNumber?: string | null;
  isVatExempt?: boolean;
}

interface InvoicePdfData {
  workspace: WorkspaceForPdf;
  invoice: Invoice;
  customer: Customer;
  lines: InvoiceLine[];
  /** Base64 data URL for QR code (Swish payment) */
  qrCodeDataUrl?: string;
}

export function generateInvoicePdf(data: InvoicePdfData): jsPDF {
  const { workspace, invoice, customer, lines, qrCodeDataUrl } = data;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header - Company info (left)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(workspace.orgName || workspace.name, margin, y);

  y += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (workspace.orgNumber) {
    doc.text(`Org.nr: ${workspace.orgNumber}`, margin, y);
    y += 5;
  }
  if (workspace.vatNumber) {
    doc.text(`VAT-nr: ${workspace.vatNumber}`, margin, y);
    y += 5;
  }
  if (workspace.address) {
    doc.text(workspace.address, margin, y);
    y += 5;
  }
  if (workspace.postalCode || workspace.city) {
    doc.text(`${workspace.postalCode || ""} ${workspace.city || ""}`.trim(), margin, y);
    y += 5;
  }
  if (workspace.contactEmail) {
    doc.text(workspace.contactEmail, margin, y);
    y += 5;
  }
  if (workspace.contactPhone) {
    doc.text(workspace.contactPhone, margin, y);
  }

  // Header - Invoice info (right)
  const rightX = pageWidth - margin;
  let rightY = margin;

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FAKTURA", rightX, rightY, { align: "right" });

  rightY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Fakturanummer: ${invoice.invoiceNumber}`, rightX, rightY, { align: "right" });

  rightY += 6;
  doc.text(`Fakturadatum: ${formatDate(invoice.invoiceDate)}`, rightX, rightY, { align: "right" });

  rightY += 6;
  doc.text(`Förfallodatum: ${formatDate(invoice.dueDate)}`, rightX, rightY, { align: "right" });

  if (invoice.reference) {
    rightY += 6;
    doc.text(`Referens: ${invoice.reference}`, rightX, rightY, { align: "right" });
  }

  // Customer info
  y = 70;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Kund", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(customer.name, margin, y);

  if (customer.orgNumber) {
    y += 5;
    doc.text(`Org.nr: ${customer.orgNumber}`, margin, y);
  }
  if (customer.address) {
    y += 5;
    doc.text(customer.address, margin, y);
  }
  if (customer.postalCode || customer.city) {
    y += 5;
    doc.text(`${customer.postalCode || ""} ${customer.city || ""}`.trim(), margin, y);
  }

  // Line items table
  y = 110;
  const colWidths = {
    desc: 65,
    qty: 20,
    unit: 20,
    price: 28,
    vat: 18,
    amount: 28,
  };

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  let colX = margin + 2;
  doc.text("Beskrivning", colX, y);
  colX += colWidths.desc;
  doc.text("Antal", colX, y);
  colX += colWidths.qty;
  doc.text("Enhet", colX, y);
  colX += colWidths.unit;
  doc.text("À-pris", colX, y);
  colX += colWidths.price;
  doc.text("Moms", colX, y);
  doc.text("Belopp", pageWidth - margin - 2, y, { align: "right" });

  y += 8;
  doc.setFont("helvetica", "normal");

  // Table rows
  for (const line of lines) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    const isTextLine = line.lineType === "text";
    let rowX = margin + 2;

    doc.text(truncate(line.description, 35), rowX, y);
    rowX += colWidths.desc;

    if (isTextLine) {
      // Text lines show dashes for numeric fields
      doc.text("-", rowX, y);
      rowX += colWidths.qty;
      doc.text("-", rowX, y);
      rowX += colWidths.unit;
      doc.text("-", rowX, y);
      rowX += colWidths.price;
      doc.text("-", rowX, y);
      doc.text("-", pageWidth - margin - 2, y, { align: "right" });
    } else {
      // Product lines show all values
      doc.text(formatNumber(parseFloat(line.quantity)), rowX, y);
      rowX += colWidths.qty;
      const unitLabel = line.unit ? (unitLabels[line.unit] || line.unit) : "-";
      doc.text(unitLabel, rowX, y);
      rowX += colWidths.unit;
      doc.text(formatCurrency(parseFloat(line.unitPrice)), rowX, y);
      rowX += colWidths.price;
      doc.text(`${line.vatRate}%`, rowX, y);
      doc.text(formatCurrency(parseFloat(line.amount)), pageWidth - margin - 2, y, { align: "right" });
    }

    y += 6;
  }

  // Totals
  y += 10;
  const totalsX = pageWidth - margin - 60;

  doc.setFont("helvetica", "normal");
  doc.text("Summa exkl. moms:", totalsX, y);
  doc.text(formatCurrency(parseFloat(invoice.subtotal)), pageWidth - margin - 2, y, { align: "right" });

  y += 6;
  doc.text("Moms:", totalsX, y);
  doc.text(formatCurrency(parseFloat(invoice.vatAmount)), pageWidth - margin - 2, y, { align: "right" });

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Att betala:", totalsX, y);
  doc.text(formatCurrency(parseFloat(invoice.total)) + " kr", pageWidth - margin - 2, y, { align: "right" });

  // Payment info section
  y += 15;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Betalningsinformation", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // Use invoice-specific payment method if set, otherwise show all workspace methods
  if (invoice.paymentMethod && invoice.paymentAccount) {
    const methodLabels: Record<string, string> = {
      bankgiro: "Bankgiro",
      plusgiro: "Plusgiro",
      iban: "IBAN",
      swish: "Swish",
      paypal: "PayPal",
      custom: "Betalning",
    };
    const label = methodLabels[invoice.paymentMethod] || "Betalning";
    doc.text(`${label}: ${invoice.paymentAccount}`, margin, y);
    y += 5;
  } else {
    // Show all available workspace payment methods
    if (workspace.bankgiro) {
      doc.text(`Bankgiro: ${workspace.bankgiro}`, margin, y);
      y += 5;
    }
    if (workspace.plusgiro) {
      doc.text(`Plusgiro: ${workspace.plusgiro}`, margin, y);
      y += 5;
    }
    if (workspace.swishNumber) {
      doc.text(`Swish: ${workspace.swishNumber}`, margin, y);
      y += 5;
    }
    if (workspace.iban) {
      let ibanText = `IBAN: ${workspace.iban}`;
      if (workspace.bic) {
        ibanText += ` / BIC: ${workspace.bic}`;
      }
      doc.text(ibanText, margin, y);
      y += 5;
    }
  }

  // Invoice reference with OCR number if available
  if (invoice.ocrNumber) {
    doc.text(`OCR-nummer: ${invoice.ocrNumber}`, margin, y);
    y += 5;
  }
  doc.text(`Märk betalningen med: Faktura ${invoice.invoiceNumber}`, margin, y);
  y += 5;

  // QR code for Swish payment (right side)
  if (qrCodeDataUrl) {
    const qrSize = 35;
    const qrX = pageWidth - margin - qrSize;
    const qrY = y - 30; // Position alongside payment info
    try {
      doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(80);
      doc.text("Betala med Swish", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });
      doc.setTextColor(0);
    } catch {
      // Silently ignore QR code errors
    }
  }

  // ROT/RUT deduction section
  if (invoice.rotRutType) {
    y += 10;
    doc.setFillColor(240, 248, 255); // Light blue background
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 28, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(
      invoice.rotRutType === "rot" ? "ROT-avdrag" : "RUT-avdrag",
      margin + 5,
      y + 2
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const laborAmount = invoice.rotRutLaborAmount ? parseFloat(invoice.rotRutLaborAmount) : 0;
    const materialAmount = invoice.rotRutMaterialAmount ? parseFloat(invoice.rotRutMaterialAmount) : 0;
    const deductionAmount = invoice.rotRutDeductionAmount ? parseFloat(invoice.rotRutDeductionAmount) : 0;
    const rate = invoice.rotRutType === "rot" ? "30%" : "50%";

    doc.text(`Arbetskostnad före skattereduktion: ${formatCurrency(laborAmount)} kr`, margin + 5, y + 9);
    doc.text(`Material och resekostnader: ${formatCurrency(materialAmount)} kr`, margin + 5, y + 15);
    doc.text(`Skattereduktion (${rate}): -${formatCurrency(deductionAmount)} kr`, margin + 5, y + 21);

    // Show customer ROT/RUT info on the right
    const rotRutRightX = pageWidth - margin - 5;
    if (customer.personalNumber) {
      doc.text(`Personnr: ${customer.personalNumber}`, rotRutRightX, y + 9, { align: "right" });
    }
    if (customer.propertyDesignation && invoice.rotRutType === "rot") {
      doc.text(`Fastighet: ${customer.propertyDesignation}`, rotRutRightX, y + 15, { align: "right" });
    }

    y += 32;
  }

  // Compliance notices section
  let hasComplianceNotices = false;
  const complianceStartY = y + 5;
  let complianceY = complianceStartY;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80);

  // Small business VAT exemption
  if (workspace.isVatExempt) {
    hasComplianceNotices = true;
    doc.text(
      "Undantagen från skatteplikt enligt 18 kap. mervärdesskattelagen",
      margin,
      complianceY
    );
    complianceY += 5;
  }

  // Reverse charge VAT
  if (invoice.isReverseCharge) {
    hasComplianceNotices = true;
    doc.text(
      "Omvänd betalningsskyldighet enligt 10 kap. mervärdesskattelagen",
      margin,
      complianceY
    );
    complianceY += 5;
    if (customer.vatNumber) {
      doc.text(`Köparens VAT-nr: ${customer.vatNumber}`, margin, complianceY);
      complianceY += 5;
    }
  }

  // Margin scheme notice (check if any line has margin scheme product)
  const hasMarginScheme = lines.some(
    (line) => line.purchasePrice !== null && line.purchasePrice !== undefined
  );
  if (hasMarginScheme) {
    hasComplianceNotices = true;
    doc.text(
      "Vinstmarginalbeskattning tillämpas enligt 18 kap. mervärdesskattelagen",
      margin,
      complianceY
    );
    complianceY += 5;
  }

  if (hasComplianceNotices) {
    y = complianceY + 5;
  }

  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");

  // Custom invoice notes (use invoice-specific notes or workspace default)
  const notesToShow = invoice.customNotes || workspace.invoiceNotes;
  if (notesToShow) {
    y = Math.max(y + 10, 250);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);

    // Word wrap the notes
    const noteLines = doc.splitTextToSize(notesToShow, pageWidth - 2 * margin);
    noteLines.forEach((line: string) => {
      if (y > 285) return; // Don't overflow page
      doc.text(line, margin, y);
      y += 4;
    });
  }

  // Delivery terms if set
  if (invoice.deliveryTerms) {
    y = Math.max(y + 5, 265);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Leveransvillkor: ${invoice.deliveryTerms}`, pageWidth / 2, y, { align: "center" });
  }

  // Payment info footer with dynamic terms and late interest
  y = 275;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);

  const paymentTerms = invoice.paymentTermsDays || workspace.paymentTermsDays || 30;
  const lateInterest = invoice.latePaymentInterest
    ? `${invoice.latePaymentInterest}% ränta`
    : workspace.latePaymentInterest
    ? `${workspace.latePaymentInterest}% ränta`
    : "dröjsmålsränta enligt lag";

  const footerText = `Betalningsvillkor: ${paymentTerms} dagar netto. Vid försenad betalning debiteras ${lateInterest}.`;
  doc.text(footerText, pageWidth / 2, y, { align: "center" });


  return doc;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value: number): string {
  return value.toLocaleString("sv-SE", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength - 3) + "..." : str;
}
