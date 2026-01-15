/**
 * NE-bilaga Field Mappings
 *
 * Maps BAS account ranges to NE-bilaga fields (SKV 2161)
 * Used for Swedish sole proprietors (enskild firma) tax declaration
 *
 * References:
 * - Skatteverket NE-bilaga: https://skatteverket.se/foretag/inkomstdeklaration/deklareraenskildnaringsverksamhet/fyllainebilagan
 * - BAS Kontoplan: https://www.bas.se/kontoplaner/
 */

// ============================================
// Balance Sheet Fields (B1-B16)
// ============================================

export interface BalanceFieldMapping {
  field: string;
  name: string;
  nameSv: string;
  accountRanges: [number, number][]; // Array of [start, end] ranges
  isAsset: boolean; // true = asset (positive = debit), false = liability/equity (positive = credit)
}

export const BALANCE_FIELD_MAPPINGS: BalanceFieldMapping[] = [
  // Anläggningstillgångar (Fixed Assets)
  {
    field: "B1",
    name: "Intangible assets",
    nameSv: "Immateriella anläggningstillgångar",
    accountRanges: [[1000, 1099]],
    isAsset: true,
  },
  {
    field: "B2",
    name: "Buildings and land improvements",
    nameSv: "Byggnader och markanläggningar",
    accountRanges: [[1100, 1119], [1150, 1199]],
    isAsset: true,
  },
  {
    field: "B3",
    name: "Land and non-depreciable assets",
    nameSv: "Mark och andra tillgångar som inte får skrivas av",
    accountRanges: [[1120, 1149]],
    isAsset: true,
  },
  {
    field: "B4",
    name: "Machinery and equipment",
    nameSv: "Maskiner och inventarier",
    accountRanges: [[1200, 1299]],
    isAsset: true,
  },
  {
    field: "B5",
    name: "Other fixed assets",
    nameSv: "Övriga anläggningstillgångar",
    accountRanges: [[1300, 1399]],
    isAsset: true,
  },

  // Omsättningstillgångar (Current Assets)
  {
    field: "B6",
    name: "Inventory",
    nameSv: "Varulager",
    accountRanges: [[1400, 1499]],
    isAsset: true,
  },
  {
    field: "B7",
    name: "Accounts receivable",
    nameSv: "Kundfordringar",
    accountRanges: [[1500, 1599]],
    isAsset: true,
  },
  {
    field: "B8",
    name: "Other receivables",
    nameSv: "Övriga fordringar",
    accountRanges: [[1600, 1899]],
    isAsset: true,
  },
  {
    field: "B9",
    name: "Cash and bank",
    nameSv: "Kassa och bank",
    accountRanges: [[1900, 1999]],
    isAsset: true,
  },

  // Eget kapital (Equity) - Calculated field
  {
    field: "B10",
    name: "Equity",
    nameSv: "Eget kapital",
    accountRanges: [[2010, 2099]], // Eget kapital accounts
    isAsset: false,
  },

  // Obeskattade reserver (Untaxed reserves)
  {
    field: "B11",
    name: "Untaxed reserves",
    nameSv: "Obeskattade reserver",
    accountRanges: [[2100, 2199]],
    isAsset: false,
  },

  // Avsättningar (Provisions)
  {
    field: "B12",
    name: "Provisions",
    nameSv: "Avsättningar",
    accountRanges: [[2200, 2299]],
    isAsset: false,
  },

  // Skulder (Liabilities)
  {
    field: "B13",
    name: "Loan liabilities",
    nameSv: "Låneskulder",
    accountRanges: [[2300, 2399]],
    isAsset: false,
  },
  {
    field: "B14",
    name: "Tax liabilities",
    nameSv: "Skatteskulder",
    accountRanges: [[2500, 2599]],
    isAsset: false,
  },
  {
    field: "B15",
    name: "Accounts payable",
    nameSv: "Leverantörsskulder",
    accountRanges: [[2400, 2449]],
    isAsset: false,
  },
  {
    field: "B16",
    name: "Other liabilities",
    nameSv: "Övriga skulder",
    accountRanges: [[2450, 2499], [2600, 2999]],
    isAsset: false,
  },
];

// ============================================
// Income Statement Fields (R1-R11)
// ============================================

export interface IncomeFieldMapping {
  field: string;
  name: string;
  nameSv: string;
  accountRanges: [number, number][]; // Array of [start, end] ranges
  isRevenue: boolean; // true = revenue (positive = credit), false = expense (positive = debit)
}

export const INCOME_FIELD_MAPPINGS: IncomeFieldMapping[] = [
  // Intäkter (Revenue)
  {
    field: "R1",
    name: "Sales and services (VAT liable)",
    nameSv: "Försäljning och utfört arbete samt övriga momspliktiga intäkter",
    accountRanges: [[3000, 3799]],
    isRevenue: true,
  },
  {
    field: "R2",
    name: "VAT-exempt revenue",
    nameSv: "Momsfria intäkter",
    accountRanges: [[3900, 3999]],
    isRevenue: true,
  },
  {
    field: "R3",
    name: "Car and housing benefits etc.",
    nameSv: "Bil- och bostadsförmån m.m.",
    accountRanges: [[3800, 3899]],
    isRevenue: true,
  },
  {
    field: "R4",
    name: "Interest income etc.",
    nameSv: "Ränteintäkter m.m.",
    accountRanges: [[8300, 8399]],
    isRevenue: true,
  },

  // Kostnader (Expenses)
  {
    field: "R5",
    name: "Goods, materials and services",
    nameSv: "Varor, material och tjänster",
    accountRanges: [[4000, 4999]],
    isRevenue: false,
  },
  {
    field: "R6",
    name: "Other external costs",
    nameSv: "Övriga externa kostnader",
    accountRanges: [[5000, 6999]],
    isRevenue: false,
  },
  {
    field: "R7",
    name: "Personnel costs",
    nameSv: "Anställd personal",
    accountRanges: [[7000, 7699]],
    isRevenue: false,
  },
  {
    field: "R8",
    name: "Interest expenses etc.",
    nameSv: "Räntekostnader m.m.",
    accountRanges: [[8400, 8499]],
    isRevenue: false,
  },
  {
    field: "R9",
    name: "Depreciation and write-downs",
    nameSv: "Av- och nedskrivningar av materiella och immateriella tillgångar",
    accountRanges: [[7800, 7899]], // All depreciation accounts
    isRevenue: false,
  },
];

// R10 and R11 are calculated fields in the calculator:
// R10 = Övriga finansiella poster (net of 8000-8299, 8500-8999 excluding already mapped R4/R8 ranges)
//       Note: In detailed NE-bilaga forms, R10 may be split into building vs machinery depreciation.
//       This simplified implementation combines all depreciation in R9 and uses R10 for financial items.
// R11 = Bokfört resultat (R1+R2+R3+R4 - R5-R6-R7-R8-R9 +/- R10)

// ============================================
// Tax Adjustment Fields (R12-R48)
// ============================================

export interface TaxAdjustmentField {
  field: string;
  name: string;
  nameSv: string;
  type: "auto" | "manual" | "calculated" | "info";
  sign: "positive" | "negative" | "both"; // Effect on taxable income
  description?: string;
}

export const TAX_ADJUSTMENT_FIELDS: TaxAdjustmentField[] = [
  // R12: Bokfört resultat (from R11)
  {
    field: "R12",
    name: "Accounting result",
    nameSv: "Bokfört resultat",
    type: "auto",
    sign: "both",
    description: "Överförs automatiskt från R11",
  },

  // R13-R16: Justeringar på företagsnivå
  {
    field: "R13",
    name: "Non-deductible expenses",
    nameSv: "Bokförda kostnader som inte ska dras av",
    type: "manual",
    sign: "positive",
    description: "T.ex. böter, skattetillägg, representation över gränsvärden",
  },
  {
    field: "R14",
    name: "Non-taxable revenue",
    nameSv: "Bokförda intäkter som inte ska tas upp",
    type: "manual",
    sign: "negative",
    description: "T.ex. skattefria bidrag",
  },
  {
    field: "R15",
    name: "Unbooked taxable revenue",
    nameSv: "Intäkter som inte bokförts men ska tas upp",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R16",
    name: "Unbooked deductible expenses",
    nameSv: "Kostnader som inte bokförts men ska dras av",
    type: "manual",
    sign: "negative",
  },

  // R17: Sammanlagt resultat (calculated)
  {
    field: "R17",
    name: "Combined result",
    nameSv: "Sammanlagt resultat",
    type: "calculated",
    sign: "both",
    description: "R12 + R13 - R14 + R15 - R16",
  },

  // R18-R20: NEA-relaterade
  {
    field: "R18",
    name: "Deducted amount (from NEA)",
    nameSv: "Avgående belopp (från NEA)",
    type: "manual",
    sign: "negative",
    description: "Resultat från separata NEA-bilagor som avgår",
  },
  {
    field: "R19",
    name: "Added amount (from NEA)",
    nameSv: "Tillkommande belopp (från NEA)",
    type: "manual",
    sign: "positive",
    description: "Resultat från separata NEA-bilagor som tillkommer",
  },
  {
    field: "R20",
    name: "Result from other business",
    nameSv: "Resultat från annan verksamhet",
    type: "manual",
    sign: "both",
  },

  // R21-R32: Individuella justeringar
  {
    field: "R21",
    name: "Commuting costs",
    nameSv: "Kostnader för resor till/från arbetet",
    type: "manual",
    sign: "negative",
    description: "Avdrag för arbetsresor enligt schablon",
  },
  {
    field: "R22",
    name: "Increased replacement fund",
    nameSv: "Ökad avsättning till ersättningsfond",
    type: "manual",
    sign: "negative",
  },
  {
    field: "R23",
    name: "Decreased replacement fund",
    nameSv: "Minskad avsättning till ersättningsfond",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R24",
    name: "Sickness benefit",
    nameSv: "Sjukpenning",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R25",
    name: "Recovered deficit (debt arrangement)",
    nameSv: "Återfört underskott vid ackord",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R26",
    name: "Recovered deficit (other)",
    nameSv: "Återfört underskott - övriga",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R27",
    name: "Other adjusted income (increase)",
    nameSv: "Annan justerad intäkt (ökning)",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R28",
    name: "Other adjusted expense (decrease)",
    nameSv: "Annan justerad kostnad (minskning)",
    type: "manual",
    sign: "negative",
  },
  {
    field: "R29",
    name: "Unutilized deficit from last year",
    nameSv: "Outnyttjat underskott från förra året",
    type: "manual",
    sign: "negative",
  },
  {
    field: "R30",
    name: "Deficit that cannot be offset",
    nameSv: "Underskott som inte får kvittas",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R31",
    name: "Deficit offset against capital",
    nameSv: "Underskott som kvittas mot kapital",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R32",
    name: "Other",
    nameSv: "Övrigt",
    type: "manual",
    sign: "both",
  },

  // R33: Underlag för periodiseringsfond (calculated)
  {
    field: "R33",
    name: "Basis for tax allocation reserve",
    nameSv: "Underlag för periodiseringsfond",
    type: "calculated",
    sign: "both",
    description: "Summa R12-R32",
  },

  // R34: Avsättning till periodiseringsfond
  {
    field: "R34",
    name: "Allocation to tax allocation reserve",
    nameSv: "Avdrag för årets avsättning till periodiseringsfond",
    type: "manual",
    sign: "negative",
    description: "Max 30% av R33 om positivt",
  },

  // R35: Underlag för expansionsfond (calculated)
  {
    field: "R35",
    name: "Basis for expansion fund",
    nameSv: "Underlag för expansionsfond",
    type: "calculated",
    sign: "both",
    description: "Summa R12-R34",
  },

  // R36: Avsättning till expansionsfond
  {
    field: "R36",
    name: "Allocation to expansion fund",
    nameSv: "Avdrag för ökning av expansionsfond",
    type: "manual",
    sign: "negative",
    description: "Begränsas av kapitalunderlag",
  },

  // R37-R42: Räntefördelning och övriga justeringar
  {
    field: "R37",
    name: "Positive interest allocation",
    nameSv: "Positiv räntefördelning",
    type: "manual",
    sign: "negative",
    description: "Överförs till inkomst av kapital",
  },
  {
    field: "R38",
    name: "Negative interest allocation",
    nameSv: "Negativ räntefördelning",
    type: "manual",
    sign: "positive",
    description: "Överförs från inkomst av kapital",
  },
  {
    field: "R39",
    name: "Allocation to forest account",
    nameSv: "Avdrag för ökning av skogskonto",
    type: "manual",
    sign: "negative",
  },
  {
    field: "R40",
    name: "Withdrawal from forest account",
    nameSv: "Uttag från skogskonto",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R41",
    name: "Other tax-related income",
    nameSv: "Övriga skattemässiga intäkter",
    type: "manual",
    sign: "positive",
  },
  {
    field: "R42",
    name: "Other tax-related deductions",
    nameSv: "Övriga skattemässiga avdrag",
    type: "manual",
    sign: "negative",
  },

  // R43-R46: Informativa fält
  {
    field: "R43",
    name: "Capital basis for interest allocation",
    nameSv: "Kapitalunderlag för räntefördelning",
    type: "info",
    sign: "both",
    description: "Informativt fält",
  },
  {
    field: "R44",
    name: "Saved allocation amount",
    nameSv: "Sparat fördelningsbelopp",
    type: "info",
    sign: "both",
    description: "Informativt fält",
  },
  {
    field: "R45",
    name: "Capital basis for expansion fund",
    nameSv: "Kapitalunderlag för expansionsfond",
    type: "info",
    sign: "both",
    description: "Informativt fält",
  },
  {
    field: "R46",
    name: "Expansion fund at year end",
    nameSv: "Expansionsfond vid årets utgång",
    type: "info",
    sign: "both",
    description: "Informativt fält",
  },

  // R47-R48: Slutresultat (calculated)
  {
    field: "R47",
    name: "Surplus from active business",
    nameSv: "Överskott av aktiv näringsverksamhet",
    type: "calculated",
    sign: "positive",
    description: "Positivt resultat som beskattas",
  },
  {
    field: "R48",
    name: "Deficit from active business",
    nameSv: "Underskott av aktiv näringsverksamhet",
    type: "calculated",
    sign: "negative",
    description: "Negativt resultat att rulla framåt",
  },
];

// ============================================
// Helper functions
// ============================================

/**
 * Check if an account number falls within a field's ranges
 */
export function isAccountInFieldRange(
  accountNumber: number,
  ranges: [number, number][]
): boolean {
  return ranges.some(
    ([start, end]) => accountNumber >= start && accountNumber <= end
  );
}

/**
 * Get the balance field that an account maps to
 */
export function getBalanceFieldForAccount(
  accountNumber: number
): BalanceFieldMapping | undefined {
  return BALANCE_FIELD_MAPPINGS.find((mapping) =>
    isAccountInFieldRange(accountNumber, mapping.accountRanges)
  );
}

/**
 * Get the income field that an account maps to
 */
export function getIncomeFieldForAccount(
  accountNumber: number
): IncomeFieldMapping | undefined {
  return INCOME_FIELD_MAPPINGS.find((mapping) =>
    isAccountInFieldRange(accountNumber, mapping.accountRanges)
  );
}

/**
 * Get all manual tax adjustment fields (for form input)
 */
export function getManualTaxAdjustmentFields(): TaxAdjustmentField[] {
  return TAX_ADJUSTMENT_FIELDS.filter((field) => field.type === "manual");
}

/**
 * Get all calculated tax adjustment fields
 */
export function getCalculatedTaxAdjustmentFields(): TaxAdjustmentField[] {
  return TAX_ADJUSTMENT_FIELDS.filter((field) => field.type === "calculated");
}

/**
 * Get tax adjustment field by field code
 */
export function getTaxAdjustmentField(
  fieldCode: string
): TaxAdjustmentField | undefined {
  return TAX_ADJUSTMENT_FIELDS.find((field) => field.field === fieldCode);
}
