import { mailer } from "./mailer";
import type { Invoice, Customer, Workspace } from "@/lib/db/schema";
import { generateInvoicePdf } from "@/lib/utils/invoice-pdf";

interface SendInvoiceEmailParams {
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
  invoiceUrl?: string;
}

export async function sendInvoiceEmailWithPdf({
  to,
  invoice,
  customer,
  workspace,
  invoiceLines,
}: SendInvoiceEmailParams): Promise<void> {
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
      purchasePrice: null,
      isLabor: null,
      isMaterial: null,
    })),
  });

  const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer") as ArrayBuffer);
  const pdfBase64 = pdfBuffer.toString("base64");

  const subject = `Faktura #${invoice.invoiceNumber} från ${workspace.orgName || workspace.name}`;

  const textContent = `
Hej ${customer.name}!

Vi skickar härmed faktura #${invoice.invoiceNumber}.

Fakturadatum: ${invoice.invoiceDate}
Förfallodatum: ${invoice.dueDate}
Totalt att betala: ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr

Se bifogad PDF för detaljer.

Med vänliga hälsningar,
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
  <h2 style="color: #1a1a1a;">Faktura #${invoice.invoiceNumber}</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Hej <strong>${customer.name}</strong>!
  </p>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Vi skickar härmed faktura #${invoice.invoiceNumber}.
  </p>
  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Fakturadatum:</strong> ${invoice.invoiceDate}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Förfallodatum:</strong> ${invoice.dueDate}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Totalt att betala:</strong> ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr
    </p>
  </div>
  <p style="color: #6b7280; font-size: 14px;">
    Se bifogad PDF för detaljer.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    Med vänliga hälsningar,<br>
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
        filename: `Faktura_${invoice.invoiceNumber}.pdf`,
        content: pdfBase64,
        encoding: "base64",
      },
    ],
  });
}

export async function sendInvoiceEmailWithLink({
  to,
  invoice,
  customer,
  workspace,
  invoiceLines,
  invoiceUrl,
}: SendInvoiceEmailParams): Promise<void> {
  if (!invoiceUrl) {
    throw new Error("Invoice URL is required for link method");
  }

  const subject = `Faktura #${invoice.invoiceNumber} från ${workspace.orgName || workspace.name}`;

  const textContent = `
Hej ${customer.name}!

Vi skickar härmed faktura #${invoice.invoiceNumber}.

Fakturadatum: ${invoice.invoiceDate}
Förfallodatum: ${invoice.dueDate}
Totalt att betala: ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr

Visa faktura: ${invoiceUrl}

Med vänliga hälsningar,
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
  <h2 style="color: #1a1a1a;">Faktura #${invoice.invoiceNumber}</h2>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Hej <strong>${customer.name}</strong>!
  </p>
  <p style="color: #4a4a4a; line-height: 1.6;">
    Vi skickar härmed faktura #${invoice.invoiceNumber}.
  </p>
  <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Fakturadatum:</strong> ${invoice.invoiceDate}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Förfallodatum:</strong> ${invoice.dueDate}
    </p>
    <p style="margin: 8px 0; color: #4a4a4a;">
      <strong>Totalt att betala:</strong> ${parseFloat(invoice.total).toLocaleString("sv-SE")} kr
    </p>
  </div>
  <p style="margin: 24px 0;">
    <a href="${invoiceUrl}"
       style="display: inline-block; background-color: #0f172a; color: #ffffff;
              padding: 12px 24px; text-decoration: none; border-radius: 6px;
              font-weight: 500;">
      Visa faktura
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    Med vänliga hälsningar,<br>
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
  });
}

