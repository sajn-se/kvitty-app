import { jsPDF } from "jspdf";
import {
  WorkspaceForReportPdf,
  ReportPeriodInfo,
  formatCurrency,
  formatDate,
  addFooter,
  drawTable,
  type TableRow,
  type TableColumn,
} from "./common";
import type { NebilagaData } from "@/lib/validations/nebilaga";

export interface NebilagaPdfData extends NebilagaData {
  workspace: WorkspaceForReportPdf;
  period: ReportPeriodInfo;
}

/**
 * Add NE-bilaga specific header
 */
function addNebilagaHeader(
  doc: jsPDF,
  data: NebilagaPdfData
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("NE-BILAGA", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Bilaga till Inkomstdeklaration 1", pageWidth / 2, y, { align: "center" });
  y += 12;

  // Period info
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Räkenskapsår: ${data.period.label} (${formatDate(data.period.startDate)} - ${formatDate(data.period.endDate)})`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  doc.setTextColor(0);
  y += 15;

  // Separator line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  return y;
}

/**
 * Add section for general information
 */
function addGeneralInfo(
  doc: jsPDF,
  data: NebilagaPdfData,
  startY: number
): number {
  const margin = 20;
  let y = startY;

  // Section title
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Allmänna uppgifter", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const info = [
    { label: "Företagsnamn", value: data.orgName || "-" },
    { label: "Organisationsnummer", value: data.orgNumber || "-" },
    { label: "Personnummer", value: data.ownerPersonalNumber || "-" },
    { label: "Adress", value: data.address || "-" },
    { label: "Postort", value: `${data.postalCode || ""} ${data.city || ""}`.trim() || "-" },
  ];

  info.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${item.label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(item.value, margin + 50, y);
    y += 5;
  });

  y += 5;
  return y;
}

/**
 * Generate NE-bilaga PDF
 */
export function generateNebilagaPdf(data: NebilagaPdfData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Header
  let y = addNebilagaHeader(doc, data);

  // 1. General Information
  y = addGeneralInfo(doc, data, y);

  // 2. Balance Sheet (Balansräkning)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Balansräkning", margin, y);
  y += 8;

  // Assets section
  const balanceColumns: TableColumn[] = [
    { header: "Fält", width: 15 },
    { header: "Benämning", width: 100 },
    { header: "Belopp", width: 35, align: "right" },
  ];

  const assetRows: TableRow[] = [
    { values: ["", "TILLGÅNGAR", ""], isGroupHeader: true },
  ];

  data.balanceFields
    .filter((f) => ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"].includes(f.field))
    .forEach((field) => {
      assetRows.push({
        values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
      });
    });

  assetRows.push({
    values: ["", "Summa tillgångar", formatCurrency(data.totalAssets / 100)],
    isSubtotal: true,
  });

  y = drawTable(doc, { columns: balanceColumns, rows: assetRows, startY: y, margin });
  y += 5;

  // Liabilities section
  const liabilityRows: TableRow[] = [
    { values: ["", "EGET KAPITAL OCH SKULDER", ""], isGroupHeader: true },
  ];

  data.balanceFields
    .filter((f) => ["B10", "B11", "B12", "B13", "B14", "B15", "B16"].includes(f.field))
    .forEach((field) => {
      liabilityRows.push({
        values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
      });
    });

  const totalLiabilities = data.balanceFields
    .filter((f) => ["B10", "B11", "B12", "B13", "B14", "B15", "B16"].includes(f.field))
    .reduce((sum, f) => sum + f.value, 0);

  liabilityRows.push({
    values: ["", "Summa eget kapital och skulder", formatCurrency(totalLiabilities / 100)],
    isSubtotal: true,
  });

  y = drawTable(doc, { columns: balanceColumns, rows: liabilityRows, startY: y, margin });
  y += 10;

  // Check for new page
  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    y = margin + 10;
  }

  // 3. Income Statement (Resultaträkning)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("3. Resultaträkning", margin, y);
  y += 8;

  // Revenue section
  const incomeRows: TableRow[] = [
    { values: ["", "INTÄKTER", ""], isGroupHeader: true },
  ];

  data.incomeFields
    .filter((f) => ["R1", "R2", "R3", "R4"].includes(f.field))
    .forEach((field) => {
      incomeRows.push({
        values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
      });
    });

  incomeRows.push({
    values: ["", "Summa intäkter", formatCurrency(data.totalRevenue / 100)],
    isSubtotal: true,
  });

  // Expense section
  incomeRows.push({ values: ["", "", ""], isGroupHeader: false });
  incomeRows.push({ values: ["", "KOSTNADER", ""], isGroupHeader: true });

  data.incomeFields
    .filter((f) => ["R5", "R6", "R7", "R8", "R9"].includes(f.field))
    .forEach((field) => {
      incomeRows.push({
        values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
      });
    });

  incomeRows.push({
    values: ["R10", "Övriga finansiella poster", formatCurrency(data.r10OtherFinancial / 100)],
  });

  incomeRows.push({
    values: ["", "Summa kostnader", formatCurrency(data.totalExpenses / 100)],
    isSubtotal: true,
  });

  // Booked result
  incomeRows.push({ values: ["", "", ""], isGroupHeader: false });
  incomeRows.push({
    values: ["R11", "Bokfört resultat", formatCurrency(data.r11BookedResult / 100)],
    isTotal: true,
  });

  y = drawTable(doc, { columns: balanceColumns, rows: incomeRows, startY: y, margin });
  y += 10;

  // New page for tax adjustments
  doc.addPage();
  y = margin + 10;

  // 4. Tax Adjustments (Skattemässiga justeringar)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("4. Skattemässiga justeringar", margin, y);
  y += 8;

  const taxRows: TableRow[] = [];

  // R12 - Bokfört resultat
  taxRows.push({
    values: ["R12", "Bokfört resultat", formatCurrency(data.r12BookedResult / 100)],
    isBold: true,
  });

  // R13-R16
  taxRows.push({ values: ["", "", ""], isGroupHeader: false });
  taxRows.push({ values: ["", "Justeringar på företagsnivå", ""], isGroupHeader: true });

  data.taxAdjustments
    .filter((f) => ["R13", "R14", "R15", "R16"].includes(f.field))
    .forEach((field) => {
      taxRows.push({
        values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
      });
    });

  // R17
  taxRows.push({
    values: ["R17", "Sammanlagt resultat", formatCurrency(data.r17CombinedResult / 100)],
    isSubtotal: true,
  });

  // R18-R32
  taxRows.push({ values: ["", "", ""], isGroupHeader: false });
  taxRows.push({ values: ["", "Individuella justeringar", ""], isGroupHeader: true });

  data.taxAdjustments
    .filter((f) =>
      ["R18", "R19", "R20", "R21", "R22", "R23", "R24", "R25", "R26", "R27", "R28", "R29", "R30", "R31", "R32"].includes(f.field)
    )
    .forEach((field) => {
      if (field.value !== 0) {
        taxRows.push({
          values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
        });
      }
    });

  // R33
  taxRows.push({
    values: ["R33", "Underlag för periodiseringsfond", formatCurrency(data.r33PeriodiseringsfondBasis / 100)],
    isSubtotal: true,
  });

  // R34-R46
  taxRows.push({ values: ["", "", ""], isGroupHeader: false });
  taxRows.push({ values: ["", "Avsättningar och räntefördelning", ""], isGroupHeader: true });

  data.taxAdjustments
    .filter((f) => ["R34", "R36", "R37", "R38", "R39", "R40", "R41", "R42"].includes(f.field))
    .forEach((field) => {
      if (field.value !== 0) {
        taxRows.push({
          values: [field.field, field.nameSv, formatCurrency(field.value / 100)],
        });
      }
    });

  // R35
  taxRows.push({
    values: ["R35", "Underlag för expansionsfond", formatCurrency(data.r35ExpansionsfondBasis / 100)],
    isSubtotal: true,
  });

  // Final result
  taxRows.push({ values: ["", "", ""], isGroupHeader: false });
  taxRows.push({ values: ["", "SLUTRESULTAT", ""], isGroupHeader: true });

  if (data.r47Surplus > 0) {
    taxRows.push({
      values: ["R47", "Överskott av aktiv näringsverksamhet", formatCurrency(data.r47Surplus / 100)],
      isTotal: true,
    });
  }

  if (data.r48Deficit > 0) {
    taxRows.push({
      values: ["R48", "Underskott av aktiv näringsverksamhet", formatCurrency(data.r48Deficit / 100)],
      isTotal: true,
    });
  }

  y = drawTable(doc, { columns: balanceColumns, rows: taxRows, startY: y, margin });

  // Info fields (R43-R46) if they have values
  const infoFields = data.taxAdjustments.filter(
    (f) => ["R43", "R44", "R45", "R46"].includes(f.field) && f.value !== 0
  );

  if (infoFields.length > 0) {
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Informativa fält", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    infoFields.forEach((field) => {
      doc.text(`${field.field}: ${field.nameSv}: ${formatCurrency(field.value / 100)} kr`, margin, y);
      y += 5;
    });
  }

  // Warning for negative balances
  if (data.hasNegativeBalances) {
    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 0, 0);
    doc.text("VARNING: Negativa saldon upptäckta i fälten: " + data.negativeBalanceFields.join(", "), margin, y);
    doc.setTextColor(0);
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, data.workspace);

    // Add page number
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Sida ${i} av ${totalPages}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
    doc.setTextColor(0);
  }

  return doc;
}
