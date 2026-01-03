import { mailer } from "./mailer";
import type { Invoice, Customer, Workspace } from "@/lib/db/schema";
import { generateInvoicePdf } from "@/lib/utils/invoice-pdf";

interface SendReminderEmailParams {
  to: string;
  invoice: Invoice;
  customer: Customer;
  workspace: Workspace;
  invoiceLines: Array<{
    description: string;
    quantity: string;
    unitPrice: string;
    vatRate: number;
    amount: string;
  }>;
  daysOverdue: number;
  reminderNumber: number;
  customMessage?: string;
}

export async function sendReminderEmailWithPdf({
  to,
  invoice,
  customer,
  workspace,
  invoiceLines,
  daysOverdue,
  reminderNumber,
  customMessage,
}: SendReminderEmailParams): Promise<void> {
  const pdfDoc = generateInvoicePdf({
    workspace,
    invoice,
    customer,
    lines: invoiceLines.map((line) => ({
      id: "",
      invoiceId: invoice.id,
      productId: null,
      lineType: "product" as const,
      description: line.description,
      quantity: line.quantity,
      unit: null,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
      productType: null,
      amount: line.amount,
      sortOrder: 0,
    })),
  });

  const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer") as ArrayBuffer);
  const pdfBase64 = pdfBuffer.toString("base64");

  const companyName = workspace.orgName || workspace.name;
  const subject = `Påminnelse ${reminderNumber}: Obetald faktura #${invoice.invoiceNumber} från ${companyName}`;

  const overdueText = daysOverdue === 1
    ? "1 dag försenad"
    : `${daysOverdue} dagar försenad`;

  const defaultMessage = `Vi vill påminna dig om att betalning för faktura #${invoice.invoiceNumber} ännu inte har registrerats. Förfallodatumet (${formatDate(invoice.dueDate)}) har passerat och fakturan är nu ${overdueText}.

Vänligen betala det utestående beloppet snarast möjligt. Om betalning redan är gjord, bortse från denna påminnelse.`;

  const messageContent = customMessage || defaultMessage;

  const textContent = `
Påminnelse om obetald faktura

Hej ${customer.name}!

${messageContent}

Fakturainformation:
- Fakturanummer: ${invoice.invoiceNumber}
- Fakturadatum: ${formatDate(invoice.invoiceDate)}
- Förfallodatum: ${formatDate(invoice.dueDate)}
- Försenad: ${overdueText}
- Totalt att betala: ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr

Se bifogad PDF för detaljer.

Med vänliga hälsningar,
${companyName}
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="color: #991b1b; margin: 0 0 8px 0; font-size: 18px;">
      Påminnelse ${reminderNumber}: Obetald faktura #${invoice.invoiceNumber}
    </h2>
    <p style="color: #dc2626; margin: 0; font-size: 14px;">
      Förfallodatum har passerat - ${overdueText}
    </p>
  </div>

  <p style="color: #4a4a4a; line-height: 1.6;">
    Hej <strong>${customer.name}</strong>!
  </p>

  <p style="color: #4a4a4a; line-height: 1.6; white-space: pre-line;">
    ${messageContent}
  </p>

  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <h3 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 14px;">Fakturainformation</h3>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Fakturanummer:</strong> ${invoice.invoiceNumber}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Fakturadatum:</strong> ${formatDate(invoice.invoiceDate)}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Förfallodatum:</strong> <span style="color: #dc2626;">${formatDate(invoice.dueDate)}</span>
    </p>
    <p style="margin: 8px 0; color: #dc2626; font-weight: 500;">
      <strong>Försenad:</strong> ${overdueText}
    </p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">
    <p style="margin: 8px 0; color: #1a1a1a; font-size: 16px;">
      <strong>Totalt att betala:</strong> ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr
    </p>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    Se bifogad PDF för fullständiga fakturadetaljer.
  </p>

  <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
    Om betalning redan är gjord, vänligen bortse från denna påminnelse.
  </p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    Med vänliga hälsningar,<br>
    ${companyName}
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
        filename: `Faktura_${invoice.invoiceNumber}.pdf`,
        content: pdfBase64,
        encoding: "base64",
      },
    ],
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("sv-SE");
}
