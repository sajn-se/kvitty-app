import { z } from "zod";
import { openingBalanceLineSchema } from "./opening-balance";

export const fiscalYearTypeSchema = z.enum(["calendar", "broken"]);

export const createPeriodSchema = z.object({
  label: z.string().min(1, "Etikett krävs").max(50, "Etikett får max vara 50 tecken"),
  urlSlug: z
    .string()
    .min(1, "URL krävs")
    .max(20, "URL får max vara 20 tecken")
    .regex(/^[a-z0-9-]+$/, "URL får bara innehålla a-z, 0-9 och bindestreck"),
  startDate: z.string().date("Ogiltigt startdatum"),
  endDate: z.string().date("Ogiltigt slutdatum"),
  fiscalYearType: fiscalYearTypeSchema.optional().default("calendar"),
  openingBalances: z.array(openingBalanceLineSchema).optional(),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "Startdatum måste vara före slutdatum",
  path: ["endDate"],
}).refine((data) => {
  if (!data.openingBalances || data.openingBalances.length === 0) return true;
  const totalDebit = data.openingBalances.reduce((sum, l) => sum + (l.debit || 0), 0);
  const totalCredit = data.openingBalances.reduce((sum, l) => sum + (l.credit || 0), 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}, {
  message: "Ingående balanser måste balansera (debet = kredit)",
  path: ["openingBalances"],
});

export const updatePeriodSchema = createPeriodSchema;

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
