import { mailer } from "./mailer";
import type { PayrollEntry, Employee, Workspace, PayrollRun } from "@/lib/db/schema";
import { generateSalaryStatementPdf } from "@/lib/utils/salary-statement-pdf";

interface SendSalaryStatementEmailParams {
  to: string;
  workspace: Workspace;
  payrollRun: Pick<PayrollRun, "period" | "paymentDate" | "runNumber">;
  payrollEntry: PayrollEntry;
  employee: Pick<Employee, "firstName" | "lastName" | "personalNumber" | "address" | "postalCode" | "city">;
}

function formatPeriod(period: string): string {
  const year = period.substring(0, 4);
  const month = parseInt(period.substring(4, 6));
  const monthNames = [
    "januari", "februari", "mars", "april", "maj", "juni",
    "juli", "augusti", "september", "oktober", "november", "december"
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

export async function sendSalaryStatementEmail({
  to,
  workspace,
  payrollRun,
  payrollEntry,
  employee,
}: SendSalaryStatementEmailParams): Promise<void> {
  const pdfDoc = generateSalaryStatementPdf({
    workspace,
    payrollRun,
    payrollEntry,
    employee,
  });

  const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer") as ArrayBuffer);
  const pdfBase64 = pdfBuffer.toString("base64");

  const periodFormatted = formatPeriod(payrollRun.period);
  const netSalary = parseFloat(payrollEntry.netSalary);

  const subject = `Lonebesked ${periodFormatted} - ${workspace.orgName || workspace.name}`;

  const textContent = `
Hej ${employee.firstName}!

Har kommer ditt lonebesked for ${periodFormatted}.

Utbetalningsdatum: ${formatDate(payrollRun.paymentDate)}
Nettoloen: ${formatCurrency(netSalary)} kr

Se bifogad PDF for fullstandig specifikation.

Med vanliga halsningar,
${workspace.orgName || workspace.name}
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a1a1a;">Lonebesked ${periodFormatted}</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Hej <strong>${employee.firstName}</strong>!
  </p>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Har kommer ditt lonebesked for ${periodFormatted}.
  </p>
  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Utbetalningsdatum:</strong> ${formatDate(payrollRun.paymentDate)}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Nettoloen:</strong> ${formatCurrency(netSalary)} kr
    </p>
  </div>
  <p style="color: #6b7280; font-size: 14px;">
    Se bifogad PDF for fullstandig specifikation.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    Med vanliga halsningar,<br>
    ${workspace.orgName || workspace.name}
  </p>
</body>
</html>
  `.trim();

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || "noreply@kvitty.app",
    to,
    subject,
    text: textContent,
    html: htmlContent,
    attachments: [
      {
        filename: `Lonebesked_${payrollRun.period}.pdf`,
        content: pdfBase64,
        encoding: "base64",
      },
    ],
  });
}
