import { z } from "zod";

export const sieVerificationLineSchema = z.object({
  accountNumber: z.number().int().min(1000).max(9999),
  accountName: z.string().min(1),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

export const sieVerificationSchema = z.object({
  sourceId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum måste vara i formatet YYYY-MM-DD"),
  description: z.string(),
  lines: z.array(sieVerificationLineSchema).min(2, "Verifikationen måste ha minst två konteringar för dubbel bokföring"),
});

export const previewSIEImportSchema = z.object({
  workspaceId: z.string().min(1),
  fileContent: z.string().min(1).max(10 * 1024 * 1024, "Filen får inte vara större än 10 MB"),
  fileName: z.string().min(1),
});

export const importSIESchema = z.object({
  workspaceId: z.string().min(1),
  fiscalPeriodId: z.string().min(1),
  verifications: z
    .array(sieVerificationSchema)
    .min(1, "Måste välja minst en verifikation att importera"),
  sourceFileName: z.string().optional(),
});

export type SIEVerificationLine = z.infer<typeof sieVerificationLineSchema>;
export type SIEVerification = z.infer<typeof sieVerificationSchema>;
export type PreviewSIEImportInput = z.infer<typeof previewSIEImportSchema>;
export type ImportSIEInput = z.infer<typeof importSIESchema>;
