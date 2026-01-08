import { z } from "zod";
import { productUnits, productTypes, marginSchemeTypes } from "./product";

// ROT/RUT deduction types
export const rotRutTypes = ["rot", "rut"] as const;
export type RotRutType = (typeof rotRutTypes)[number];

// Labels for ROT/RUT types
export const rotRutTypeLabels: Record<RotRutType, string> = {
  rot: "ROT (30% av arbetskostnad)",
  rut: "RUT (50% av arbetskostnad)",
};

export const invoiceLineSchema = z.object({
  productId: z.string().optional(),
  lineType: z.enum(["product", "text"]).default("product"),
  description: z.string().min(1, "Beskrivning krävs"),
  quantity: z.number().min(0.01, "Antal måste vara minst 0.01"),
  unit: z.enum(productUnits).optional(),
  unitPrice: z.number().min(0, "Pris måste vara minst 0"),
  vatRate: z
    .number()
    .refine((v) => [0, 6, 12, 25].includes(v), "Ogiltig momssats"),
});

// Simplified create schema - no lines required (add them on detail page)
export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, "Kund krävs"),
  fiscalPeriodId: z.string().optional(),
  invoiceDate: z.string().date("Ogiltigt fakturadatum"),
  dueDate: z.string().date("Ogiltigt förfallodatum"),
  reference: z.string().max(50).optional(),
});

// Full update schema with lines
export const updateInvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "Kund krävs"),
  fiscalPeriodId: z.string().optional(),
  invoiceDate: z.string().date("Ogiltigt fakturadatum"),
  dueDate: z.string().date("Ogiltigt förfallodatum"),
  reference: z.string().max(50).optional(),
  lines: z.array(invoiceLineSchema),
});

// Schema for adding a single line to an invoice
export const addInvoiceLineSchema = z.object({
  invoiceId: z.string(),
  productId: z.string().optional(),
  lineType: z.enum(["product", "text"]).default("product"),
  description: z.string().min(1, "Beskrivning krävs"),
  quantity: z.number().min(0.01, "Antal måste vara minst 0.01"),
  unit: z.enum(productUnits).optional(),
  unitPrice: z.number().min(0, "Pris måste vara minst 0"),
  vatRate: z
    .number()
    .refine((v) => [0, 6, 12, 25].includes(v), "Ogiltig momssats"),
});

// Schema for updating a single line
export const updateInvoiceLineSchema = z.object({
  lineId: z.string(),
  invoiceId: z.string(),
  description: z.string().min(1, "Beskrivning krävs").optional(),
  quantity: z.number().min(0.01, "Antal måste vara minst 0.01").optional(),
  unit: z.enum(productUnits).optional().nullable(),
  unitPrice: z.number().min(0, "Pris måste vara minst 0").optional(),
  vatRate: z
    .number()
    .refine((v) => [0, 6, 12, 25].includes(v), "Ogiltig momssats")
    .optional(),
  productType: z.enum(productTypes).optional().nullable(),
  // ROT/RUT categorization
  isLabor: z.boolean().optional(),
  isMaterial: z.boolean().optional(),
  // Margin scheme purchase price
  purchasePrice: z.number().min(0).optional().nullable(),
});

// Schema for updating line order (drag and drop)
export const updateLineOrderSchema = z.object({
  invoiceId: z.string(),
  lineIds: z.array(z.string()),
});

// Schema for updating invoice metadata (dates, customer, reference)
export const updateInvoiceMetadataSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, "Kund krävs").optional(),
  invoiceDate: z.string().date("Ogiltigt fakturadatum").optional(),
  dueDate: z.string().date("Ogiltigt förfallodatum").optional(),
  reference: z.string().max(50).optional().nullable(),
});

// Payment methods
export const paymentMethods = [
  "bankgiro",
  "plusgiro",
  "iban",
  "swish",
  "paypal",
  "custom",
] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

// Delivery methods
export const deliveryMethods = [
  "email_pdf",
  "email_link",
  "manual",
  "e_invoice",
] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

// Schema for updating invoice advanced settings
export const updateInvoiceSettingsSchema = z.object({
  id: z.string(),
  deliveryTerms: z.string().max(200).optional().nullable(),
  latePaymentInterest: z
    .number()
    .min(0, "Ränta måste vara minst 0%")
    .max(100, "Ränta kan inte överstiga 100%")
    .optional()
    .nullable(),
  paymentTermsDays: z
    .number()
    .int("Betalningsvillkor måste vara ett heltal")
    .min(1, "Betalningsvillkor måste vara minst 1 dag")
    .max(365, "Betalningsvillkor kan inte överstiga 365 dagar")
    .optional()
    .nullable(),
  paymentMethod: z.enum(paymentMethods).optional().nullable(),
  paymentAccount: z.string().max(100).optional().nullable(),
  ocrNumber: z.string().max(50).optional().nullable(),
  customNotes: z.string().max(1000).optional().nullable(),
  deliveryMethod: z.enum(deliveryMethods).optional().nullable(),
});

// Schema for updating invoice compliance settings (reverse charge, ROT/RUT)
export const updateInvoiceComplianceSchema = z.object({
  id: z.string(),
  isReverseCharge: z.boolean().optional(),
  rotRutType: z.enum(rotRutTypes).optional().nullable(),
  rotRutDeductionAmount: z.number().min(0).optional().nullable(),
  rotRutDeductionManualOverride: z.boolean().optional(),
});

export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type AddInvoiceLineInput = z.infer<typeof addInvoiceLineSchema>;
export type UpdateInvoiceLineInput = z.infer<typeof updateInvoiceLineSchema>;
export type UpdateLineOrderInput = z.infer<typeof updateLineOrderSchema>;
export type UpdateInvoiceMetadataInput = z.infer<typeof updateInvoiceMetadataSchema>;
export type UpdateInvoiceSettingsInput = z.infer<typeof updateInvoiceSettingsSchema>;
export type UpdateInvoiceComplianceInput = z.infer<typeof updateInvoiceComplianceSchema>;
