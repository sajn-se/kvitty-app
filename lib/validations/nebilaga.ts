import { z } from "zod";

/**
 * NE-bilaga validation schemas for tax adjustments (R13-R48)
 * All amounts are stored in öre (cents) for precision
 */

// Schema for saving NE-bilaga tax adjustments
export const saveNebilagaAdjustmentsSchema = z.object({
  workspaceId: z.string().min(1, "Workspace krävs"),
  fiscalPeriodId: z.string().min(1, "Räkenskapsår krävs"),

  // R13-R16: Justeringar på företagsnivå
  r13: z.number().int().default(0), // Bokförda kostnader som inte ska dras av
  r14: z.number().int().default(0), // Bokförda intäkter som inte ska tas upp
  r15: z.number().int().default(0), // Intäkter som inte bokförts men ska tas upp
  r16: z.number().int().default(0), // Kostnader som inte bokförts men ska dras av

  // R18-R20: NEA-relaterade justeringar
  r18: z.number().int().default(0), // Avgående belopp (från NEA)
  r19: z.number().int().default(0), // Tillkommande belopp (från NEA)
  r20: z.number().int().default(0), // Resultat från annan verksamhet

  // R21-R32: Individuella justeringar
  r21: z.number().int().default(0), // Kostnader för resor till/från arbetet
  r22: z.number().int().default(0), // Ökad avsättning till ersättningsfond
  r23: z.number().int().default(0), // Minskad avsättning till ersättningsfond
  r24: z.number().int().default(0), // Sjukpenning
  r25: z.number().int().default(0), // Återfört underskott vid ackord
  r26: z.number().int().default(0), // Återfört underskott - övriga
  r27: z.number().int().default(0), // Annan justerad intäkt (ökning)
  r28: z.number().int().default(0), // Annan justerad kostnad (minskning)
  r29: z.number().int().default(0), // Outnyttjat underskott från förra året
  r30: z.number().int().default(0), // Underskott som inte får kvittas
  r31: z.number().int().default(0), // Underskott som kvittas mot kapital
  r32: z.number().int().default(0), // Övrigt

  // R34, R36: Avsättningar
  r34: z.number().int().default(0), // Avdrag för årets avsättning till periodiseringsfond
  r36: z.number().int().default(0), // Avdrag för ökning av expansionsfond

  // R37-R46: Räntefördelning och övriga
  r37: z.number().int().default(0), // Positiv räntefördelning
  r38: z.number().int().default(0), // Negativ räntefördelning
  r39: z.number().int().default(0), // Avdrag för ökning av skogskonto
  r40: z.number().int().default(0), // Uttag från skogskonto
  r41: z.number().int().default(0), // Övriga skattemässiga intäkter
  r42: z.number().int().default(0), // Övriga skattemässiga avdrag
  r43: z.number().int().default(0), // Kapitalunderlag för räntefördelning (info)
  r44: z.number().int().default(0), // Sparat fördelningsbelopp (info)
  r45: z.number().int().default(0), // Kapitalunderlag för expansionsfond (info)
  r46: z.number().int().default(0), // Expansionsfond vid årets utgång (info)
});

export type SaveNebilagaAdjustmentsInput = z.infer<typeof saveNebilagaAdjustmentsSchema>;

// Schema for getting NE-bilaga data
export const getNebilagaSchema = z.object({
  fiscalPeriodId: z.string().min(1, "Räkenskapsår krävs"),
});

export type GetNebilagaInput = z.infer<typeof getNebilagaSchema>;

// Schema for field mapping request
export const getFieldMappingSchema = z.object({
  fiscalPeriodId: z.string().min(1, "Räkenskapsår krävs"),
  field: z.string().min(1, "Fält krävs"), // e.g., "B1", "R1", "R12"
});

export type GetFieldMappingInput = z.infer<typeof getFieldMappingSchema>;

// Types for NE-bilaga data response
export interface NebilagaBalanceField {
  field: string;
  nameSv: string;
  value: number; // In öre
  isNegative: boolean; // Warning flag
}

export interface NebilagaIncomeField {
  field: string;
  nameSv: string;
  value: number; // In öre
}

export interface NebilagaTaxAdjustmentField {
  field: string;
  nameSv: string;
  value: number; // In öre
  type: "auto" | "manual" | "calculated" | "info";
  description?: string;
}

export interface NebilagaFieldMapping {
  field: string;
  accounts: Array<{
    accountNumber: number;
    accountName: string;
    balance: number;
  }>;
  verifications: Array<{
    verificationNumber: number;
    description: string;
    accountNumber: number;
    amount: number;
    date: string;
  }>;
  openingBalance: number;
}

export interface NebilagaData {
  // General info
  workspaceId: string;
  fiscalPeriodId: string;
  periodLabel: string;
  startDate: string;
  endDate: string;

  // Workspace info
  orgName: string | null;
  orgNumber: string | null;
  ownerPersonalNumber: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;

  // Balance sheet (B1-B16)
  balanceFields: NebilagaBalanceField[];
  totalAssets: number;
  totalLiabilities: number;

  // Income statement (R1-R11)
  incomeFields: NebilagaIncomeField[];
  totalRevenue: number;
  totalExpenses: number;
  r10OtherFinancial: number;
  r11BookedResult: number;

  // Tax adjustments (R12-R48)
  taxAdjustments: NebilagaTaxAdjustmentField[];

  // Final calculated results
  r12BookedResult: number; // = R11
  r17CombinedResult: number; // R12 + R13 - R14 + R15 - R16
  r33PeriodiseringsfondBasis: number;
  r35ExpansionsfondBasis: number;
  r47Surplus: number; // Positive final result
  r48Deficit: number; // Negative final result

  // Warnings
  hasNegativeBalances: boolean;
  negativeBalanceFields: string[];
}
