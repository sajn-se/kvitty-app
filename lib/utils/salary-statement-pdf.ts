import { jsPDF } from "jspdf";
import type { PayrollEntry, Employee, Workspace, PayrollRun } from "@/lib/db/schema";

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
}

interface SalaryStatementPdfData {
  workspace: WorkspaceForPdf;
  payrollRun: Pick<PayrollRun, "period" | "paymentDate" | "runNumber">;
  payrollEntry: PayrollEntry;
  employee: Pick<Employee, "firstName" | "lastName" | "personalNumber" | "address" | "postalCode" | "city">;
}

export function generateSalaryStatementPdf(data: SalaryStatementPdfData): jsPDF {
  const { workspace, payrollRun, payrollEntry, employee } = data;
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

  // Header - Document title (right)
  const rightX = pageWidth - margin;
  let rightY = margin;

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LÖNEBESKED", rightX, rightY, { align: "right" });

  rightY += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${formatPeriod(payrollRun.period)}`, rightX, rightY, { align: "right" });

  rightY += 6;
  doc.text(`Utbetalningsdatum: ${formatDate(payrollRun.paymentDate)}`, rightX, rightY, { align: "right" });

  // Employee info section
  y = 70;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Anställd", margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`${employee.firstName} ${employee.lastName}`, margin, y);

  y += 5;
  // Show masked personal number (YYYYMMDD-XXXX)
  const maskedPersonalNumber = maskPersonalNumber(employee.personalNumber);
  doc.text(`Personnummer: ${maskedPersonalNumber}`, margin, y);

  if (employee.address) {
    y += 5;
    doc.text(employee.address, margin, y);
  }
  if (employee.postalCode || employee.city) {
    y += 5;
    doc.text(`${employee.postalCode || ""} ${employee.city || ""}`.trim(), margin, y);
  }

  // Salary details section
  y = 110;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Lönespecifikation", margin, y);

  y += 10;

  // Create table for salary details
  const labelX = margin;
  const valueX = pageWidth - margin;

  // Draw header row
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, pageWidth - 2 * margin, 8, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Beskrivning", labelX + 2, y);
  doc.text("Belopp", valueX - 2, y, { align: "right" });

  y += 10;
  doc.setFont("helvetica", "normal");

  // Gross salary (Bruttolön)
  doc.text("Bruttolön", labelX + 2, y);
  doc.text(formatCurrency(parseFloat(payrollEntry.grossSalary)) + " kr", valueX - 2, y, { align: "right" });
  y += 8;

  // Benefits section if any
  const benefitsCar = parseFloat(payrollEntry.benefitsCar || "0");
  const benefitsOther = parseFloat(payrollEntry.benefitsOther || "0");
  const hasBenefits = benefitsCar > 0 || benefitsOther > 0;

  if (hasBenefits) {
    doc.setFont("helvetica", "bold");
    doc.text("Förmåner (skattepliktiga)", labelX + 2, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    if (benefitsCar > 0) {
      doc.text("   Bilförmån", labelX + 2, y);
      doc.text(formatCurrency(benefitsCar) + " kr", valueX - 2, y, { align: "right" });
      y += 6;
    }

    if (benefitsOther > 0) {
      doc.text("   Övriga förmåner", labelX + 2, y);
      doc.text(formatCurrency(benefitsOther) + " kr", valueX - 2, y, { align: "right" });
      y += 6;
    }
    y += 2;
  }

  // Separator line
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Tax deduction (Skatteavdrag)
  doc.text("Skatteavdrag", labelX + 2, y);
  doc.text("-" + formatCurrency(parseFloat(payrollEntry.taxDeduction)) + " kr", valueX - 2, y, { align: "right" });
  y += 10;

  // Separator line before net
  doc.setDrawColor(100);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Net salary (Nettolön)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Nettolön (utbetalas)", labelX + 2, y);
  doc.text(formatCurrency(parseFloat(payrollEntry.netSalary)) + " kr", valueX - 2, y, { align: "right" });

  // Employer contributions section (informational)
  y += 25;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Information", margin, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);

  doc.text("Arbetsgivaravgifter (betalas av arbetsgivaren)", labelX + 2, y);
  doc.text(formatCurrency(parseFloat(payrollEntry.employerContributions)) + " kr", valueX - 2, y, { align: "right" });

  y += 6;
  doc.setFontSize(9);
  doc.text("Arbetsgivaravgifterna är inte en del av din lön, men betalas av arbetsgivaren till staten.", labelX + 2, y);

  // Footer
  doc.setTextColor(100);
  doc.setFontSize(8);
  y = 275;
  const footerText = `Lönebesked genererat av ${workspace.orgName || workspace.name}`;
  doc.text(footerText, pageWidth / 2, y, { align: "center" });

  return doc;
}

function formatPeriod(period: string): string {
  // period is YYYYMM format
  const year = period.substring(0, 4);
  const month = parseInt(period.substring(4, 6));
  const monthNames = [
    "Januari", "Februari", "Mars", "April", "Maj", "Juni",
    "Juli", "Augusti", "September", "Oktober", "November", "December"
  ];
  return `${monthNames[month - 1]} ${year}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE");
}

function formatCurrency(value: number): string {
  return value.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskPersonalNumber(personalNumber: string): string {
  // personalNumber format: YYYYMMDDXXXX (12 digits)
  // Show as: YYYYMMDD-XXXX (with dash)
  if (personalNumber.length === 12) {
    return `${personalNumber.substring(0, 8)}-${personalNumber.substring(8)}`;
  }
  return personalNumber;
}
