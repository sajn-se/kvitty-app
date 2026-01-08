import { z } from "zod";

export const openingBalanceLineSchema = z.object({
  accountNumber: z
    .number()
    .int()
    .min(1000, "Endast balanskonton (1000-2999) tillåtna")
    .max(2999, "Endast balanskonton (1000-2999) tillåtna"),
  accountName: z.string().min(1, "Kontonamn krävs"),
  debit: z.number().min(0).nullable().optional(),
  credit: z.number().min(0).nullable().optional(),
});

export const openingBalancesSchema = z
  .array(openingBalanceLineSchema)
  .refine(
    (lines) => {
      const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
      const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    {
      message: "Ingående balanser måste balansera (debet = kredit)",
    }
  );

export type OpeningBalanceLineInput = z.infer<typeof openingBalanceLineSchema>;
