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
}

interface InvoicePdfData {
  workspace: WorkspaceForPdf;
  invoice: Invoice;
  customer: Customer;
  lines: InvoiceLine[];
}

export function generateInvoicePdf(data: InvoicePdfData): jsPDF {
  const { workspace, invoice, customer, lines } = data;
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
  const hasPaymentInfo = workspace.bankgiro || workspace.plusgiro || workspace.iban || workspace.swishNumber;
  if (hasPaymentInfo) {
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("Betalningsinformation", margin, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

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

    // Invoice reference
    doc.text(`Märk betalningen med: Faktura ${invoice.invoiceNumber}`, margin, y);
  }

  // Custom invoice notes
  if (workspace.invoiceNotes) {
    y = Math.max(y + 15, 250);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);

    // Word wrap the notes
    const noteLines = doc.splitTextToSize(workspace.invoiceNotes, pageWidth - 2 * margin);
    noteLines.forEach((line: string) => {
      if (y > 285) return; // Don't overflow page
      doc.text(line, margin, y);
      y += 4;
    });
  }

  // Payment info footer
  y = 275;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);

  const footerText = `Betalningsvillkor: 30 dagar netto. Vid försenad betalning debiteras dröjsmålsränta enligt lag.`;
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
