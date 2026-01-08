import { z } from "zod";

export const journalEntryTypes = [
  "kvitto",
  "inkomst",
  "leverantorsfaktura",
  "lon",
  "utlagg",
  "annat",
] as const;
export type JournalEntryType = (typeof journalEntryTypes)[number];

export const vatCodes = ["25", "12", "6", "0"] as const;
export type VatCode = (typeof vatCodes)[number];

export const journalEntryLineSchema = z.object({
  accountNumber: z
    .number()
    .int()
    .min(1000, "Kontonummer måste vara minst 4 siffror")
    .max(9999, "Kontonummer får max vara 4 siffror"),
  accountName: z.string().min(1, "Kontonamn krävs"),
  debit: z.number().min(0).optional().nullable(),
  credit: z.number().min(0).optional().nullable(),
  description: z.string().max(500).optional(),
  vatCode: z.enum(vatCodes).optional().nullable(),
});

export const createJournalEntrySchema = z
  .object({
    workspaceId: z.string(),
    fiscalPeriodId: z.string(),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ogiltigt datumformat"),
    description: z.string().min(1, "Beskrivning krävs").max(500),
    entryType: z.enum(journalEntryTypes),
    sourceType: z.enum(["manual", "ai_assisted", "payroll", "bank_import"]).optional(),
    lines: z
      .array(journalEntryLineSchema)
      .min(2, "Minst två rader krävs för en verifikation"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce(
        (sum, line) => sum + (line.debit || 0),
        0
      );
      const totalCredit = data.lines.reduce(
        (sum, line) => sum + (line.credit || 0),
        0
      );
      // Allow small rounding differences
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    {
      message: "Debet och kredit måste balansera",
      path: ["lines"],
    }
  );

export const updateJournalEntrySchema = z.object({
  id: z.string(),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ogiltigt datumformat")
    .optional(),
  description: z.string().min(1).max(500).optional(),
  entryType: z.enum(journalEntryTypes).optional(),
  lines: z.array(journalEntryLineSchema).min(2).optional(),
});

export type JournalEntryLineInput = z.infer<typeof journalEntryLineSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
