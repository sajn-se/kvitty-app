import QRCode from "qrcode";

/**
 * Swish QR code options
 */
interface SwishQROptions {
  /** Swish number (10 digits for businesses) */
  payeeNumber: string;
  /** Amount in SEK (optional for prefilled amount) */
  amount?: number;
  /** Payment reference (OCR or invoice number) */
  message: string;
  /** Whether the amount can be changed by payer */
  editableAmount?: boolean;
}

/**
 * Generate a Swish QR code for payments
 * Uses the Swish deep link format
 */
export async function generateSwishQR(options: SwishQROptions): Promise<string> {
  const { payeeNumber, amount, message, editableAmount = false } = options;

  // Clean phone number (remove spaces, dashes)
  const cleanNumber = payeeNumber.replace(/[\s-]/g, "");

  // Build Swish URL with parameters
  // Format: https://app.swish.nu/1/p/sw/?sw=<number>&amt=<amount>&cur=SEK&msg=<message>&edit=true/false
  const swishUrl = new URL("https://app.swish.nu/1/p/sw/");
  swishUrl.searchParams.set("sw", cleanNumber);
  if (amount !== undefined && amount > 0) {
    swishUrl.searchParams.set("amt", amount.toFixed(2));
  }
  swishUrl.searchParams.set("cur", "SEK");
  swishUrl.searchParams.set("msg", message.slice(0, 50)); // Max 50 chars
  if (!editableAmount && amount !== undefined) {
    swishUrl.searchParams.set("edit", "amt");
  }

  return QRCode.toDataURL(swishUrl.toString(), {
    width: 200,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * EPC QR code options for SEPA Credit Transfer
 * Based on EPC069-12 guidelines
 */
interface EPCQROptions {
  /** Beneficiary IBAN */
  iban: string;
  /** BIC/SWIFT code */
  bic?: string;
  /** Beneficiary name (max 70 chars) */
  recipientName: string;
  /** Amount */
  amount: number;
  /** Currency (default EUR, note: SEK not officially supported) */
  currency?: string;
  /** Unstructured remittance information (max 140 chars) */
  reference: string;
}

/**
 * Generate an EPC QR code for bank transfers
 * Note: EPC QR is primarily designed for EUR transfers.
 * Swedish banks may have limited support for SEK.
 */
export async function generateEPCQR(options: EPCQROptions): Promise<string> {
  const {
    iban,
    bic = "",
    recipientName,
    amount,
    reference,
    currency = "SEK",
  } = options;

  // EPC QR Code format according to EPC069-12
  // Each line is a specific field
  const epcData = [
    "BCD",                              // Service Tag (always "BCD")
    "002",                              // Version (002 for UTF-8)
    "1",                                // Character set (1 = UTF-8)
    "SCT",                              // Identification (SCT = SEPA Credit Transfer)
    bic,                                // BIC (8 or 11 chars, optional in SEPA)
    recipientName.slice(0, 70),         // Beneficiary name (max 70 chars)
    iban.replace(/\s/g, ""),            // IBAN (no spaces)
    `${currency}${amount.toFixed(2)}`,  // Amount with currency
    "",                                 // Purpose (optional)
    "",                                 // Structured remittance (optional)
    reference.slice(0, 140),            // Unstructured remittance (max 140 chars)
    "",                                 // Beneficiary to user info (optional)
  ].join("\n");

  return QRCode.toDataURL(epcData, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a simple payment QR code with basic payment info
 * Can be used for generic bank payments
 */
interface PaymentQROptions {
  /** Bankgiro number */
  bankgiro?: string;
  /** Plusgiro number */
  plusgiro?: string;
  /** Amount */
  amount: number;
  /** OCR reference */
  ocr?: string;
  /** Invoice number */
  invoiceNumber?: string;
  /** Recipient name */
  recipientName: string;
}

/**
 * Generate a simple text-based payment QR code
 * Format: Human-readable text with payment details
 */
export async function generatePaymentInfoQR(options: PaymentQROptions): Promise<string> {
  const { bankgiro, plusgiro, amount, ocr, invoiceNumber, recipientName } = options;

  const lines = [
    `Betalning till: ${recipientName}`,
    `Belopp: ${amount.toFixed(2)} kr`,
  ];

  if (bankgiro) {
    lines.push(`Bankgiro: ${bankgiro}`);
  }
  if (plusgiro) {
    lines.push(`Plusgiro: ${plusgiro}`);
  }
  if (ocr) {
    lines.push(`OCR: ${ocr}`);
  } else if (invoiceNumber) {
    lines.push(`Fakturanr: ${invoiceNumber}`);
  }

  return QRCode.toDataURL(lines.join("\n"), {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate QR code as SVG string (for inline rendering)
 */
export async function generateSwishQRSvg(options: SwishQROptions): Promise<string> {
  const { payeeNumber, amount, message, editableAmount = false } = options;

  const cleanNumber = payeeNumber.replace(/[\s-]/g, "");
  const swishUrl = new URL("https://app.swish.nu/1/p/sw/");
  swishUrl.searchParams.set("sw", cleanNumber);
  if (amount !== undefined && amount > 0) {
    swishUrl.searchParams.set("amt", amount.toFixed(2));
  }
  swishUrl.searchParams.set("cur", "SEK");
  swishUrl.searchParams.set("msg", message.slice(0, 50));
  if (!editableAmount && amount !== undefined) {
    swishUrl.searchParams.set("edit", "amt");
  }

  return QRCode.toString(swishUrl.toString(), {
    type: "svg",
    width: 200,
    margin: 1,
  });
}
