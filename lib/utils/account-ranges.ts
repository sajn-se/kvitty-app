/**
 * Swedish BAS kontoplan account ranges
 * Used for financial report categorization
 */

export const ACCOUNT_RANGES = {
  // Tillgångar (Assets) - 1000-1999
  ASSETS: { start: 1000, end: 1999 },
  FIXED_ASSETS: { start: 1000, end: 1299 },
  INTANGIBLE_ASSETS: { start: 1000, end: 1099 },
  BUILDINGS_LAND: { start: 1100, end: 1199 },
  MACHINERY_EQUIPMENT: { start: 1200, end: 1299 },
  FINANCIAL_ASSETS: { start: 1300, end: 1399 },
  CURRENT_ASSETS: { start: 1400, end: 1999 },
  INVENTORY: { start: 1400, end: 1499 },
  RECEIVABLES: { start: 1500, end: 1699 },
  CUSTOMER_RECEIVABLES: { start: 1500, end: 1599 },
  OTHER_RECEIVABLES: { start: 1600, end: 1699 },
  PREPAID_EXPENSES: { start: 1700, end: 1799 },
  CASH_BANK: { start: 1900, end: 1999 },

  // Eget kapital och skulder (Equity & Liabilities) - 2000-2999
  EQUITY_LIABILITIES: { start: 2000, end: 2999 },
  EQUITY: { start: 2000, end: 2099 },
  UNTAXED_RESERVES: { start: 2100, end: 2199 },
  PROVISIONS: { start: 2200, end: 2299 },
  LONG_TERM_LIABILITIES: { start: 2300, end: 2499 },
  CURRENT_LIABILITIES: { start: 2400, end: 2999 },
  SUPPLIER_DEBTS: { start: 2400, end: 2499 },
  TAX_LIABILITIES: { start: 2500, end: 2599 },

  // Moms (VAT) accounts - 2600-2699
  VAT: { start: 2600, end: 2699 },
  OUTPUT_VAT: { start: 2610, end: 2639 },
  OUTPUT_VAT_25: { start: 2610, end: 2619 },
  OUTPUT_VAT_12: { start: 2620, end: 2629 },
  OUTPUT_VAT_6: { start: 2630, end: 2639 },
  INPUT_VAT: { start: 2640, end: 2649 },
  VAT_SETTLEMENT: { start: 2650, end: 2659 },
  VAT_FOREIGN: { start: 2660, end: 2699 },

  // Other current liabilities
  PERSONNEL_LIABILITIES: { start: 2700, end: 2799 },
  OTHER_CURRENT_LIABILITIES: { start: 2800, end: 2999 },

  // Intäkter (Revenue) - 3000-3999
  REVENUE: { start: 3000, end: 3999 },
  SALES_GOODS: { start: 3000, end: 3099 },
  SALES_SERVICES: { start: 3100, end: 3199 },
  OTHER_REVENUE: { start: 3200, end: 3999 },

  // Kostnader (Expenses) - 4000-8999
  EXPENSES: { start: 4000, end: 8999 },
  COST_OF_GOODS_SOLD: { start: 4000, end: 4999 },
  PURCHASES: { start: 4000, end: 4099 },
  EXTERNAL_COSTS: { start: 5000, end: 6999 },
  PREMISES: { start: 5000, end: 5099 },
  VEHICLE: { start: 5600, end: 5699 },
  TRAVEL: { start: 5800, end: 5899 },
  MARKETING: { start: 5900, end: 5999 },
  ADMIN: { start: 6000, end: 6999 },
  PERSONNEL_COSTS: { start: 7000, end: 7699 },
  SALARIES: { start: 7000, end: 7099 },
  SOCIAL_FEES: { start: 7500, end: 7599 },
  DEPRECIATION: { start: 7800, end: 7899 },
  FINANCIAL: { start: 8000, end: 8499 },
  FINANCIAL_INCOME: { start: 8300, end: 8399 },
  FINANCIAL_EXPENSES: { start: 8400, end: 8499 },
  EXTRAORDINARY: { start: 8700, end: 8799 },
  YEAR_END: { start: 8800, end: 8899 },
  TAX: { start: 8900, end: 8999 },
} as const;

export type AccountRange = (typeof ACCOUNT_RANGES)[keyof typeof ACCOUNT_RANGES];

/**
 * Check if an account number is within a range
 */
export function isInRange(
  accountNumber: number,
  range: AccountRange
): boolean {
  return accountNumber >= range.start && accountNumber <= range.end;
}

/**
 * Get the account category for a given account number
 */
export function getAccountCategory(accountNumber: number): string {
  if (isInRange(accountNumber, ACCOUNT_RANGES.ASSETS)) {
    return "Tillgångar";
  }
  if (isInRange(accountNumber, ACCOUNT_RANGES.EQUITY)) {
    return "Eget kapital";
  }
  if (isInRange(accountNumber, ACCOUNT_RANGES.VAT)) {
    return "Moms";
  }
  if (
    accountNumber >= 2100 &&
    accountNumber <= 2999 &&
    !isInRange(accountNumber, ACCOUNT_RANGES.VAT)
  ) {
    return "Skulder";
  }
  if (isInRange(accountNumber, ACCOUNT_RANGES.REVENUE)) {
    return "Intäkter";
  }
  if (isInRange(accountNumber, ACCOUNT_RANGES.EXPENSES)) {
    return "Kostnader";
  }
  return "Övrigt";
}

/**
 * Get the account type for balance sheet vs income statement
 */
export function getAccountType(
  accountNumber: number
): "balance" | "income" | "vat" {
  if (accountNumber >= 1000 && accountNumber <= 2999) {
    if (isInRange(accountNumber, ACCOUNT_RANGES.VAT)) {
      return "vat";
    }
    return "balance";
  }
  return "income";
}

/**
 * Determine if an account is a debit or credit account by default
 * Assets and Expenses are debit accounts (increase with debit)
 * Liabilities, Equity, and Revenue are credit accounts (increase with credit)
 */
export function isDebitAccount(accountNumber: number): boolean {
  // Assets (1000-1999) and Expenses (4000-8999) are debit accounts
  return (
    isInRange(accountNumber, ACCOUNT_RANGES.ASSETS) ||
    isInRange(accountNumber, ACCOUNT_RANGES.EXPENSES)
  );
}

/**
 * Calculate the balance for an account based on its type
 * For debit accounts: debit - credit (positive = debit balance)
 * For credit accounts: credit - debit (positive = credit balance)
 */
export function calculateAccountBalance(
  accountNumber: number,
  totalDebit: number,
  totalCredit: number
): number {
  if (isDebitAccount(accountNumber)) {
    return totalDebit - totalCredit;
  }
  return totalCredit - totalDebit;
}

/**
 * Group accounts by main category for reporting
 */
export const INCOME_STATEMENT_GROUPS = [
  {
    name: "Nettoomsättning",
    ranges: [ACCOUNT_RANGES.SALES_GOODS, ACCOUNT_RANGES.SALES_SERVICES],
  },
  { name: "Övriga rörelseintäkter", ranges: [ACCOUNT_RANGES.OTHER_REVENUE] },
  { name: "Varuinköp", ranges: [ACCOUNT_RANGES.COST_OF_GOODS_SOLD] },
  { name: "Övriga externa kostnader", ranges: [ACCOUNT_RANGES.EXTERNAL_COSTS] },
  { name: "Personalkostnader", ranges: [ACCOUNT_RANGES.PERSONNEL_COSTS] },
  {
    name: "Avskrivningar",
    ranges: [ACCOUNT_RANGES.DEPRECIATION],
  },
  { name: "Finansiella poster", ranges: [ACCOUNT_RANGES.FINANCIAL] },
  { name: "Skatt på årets resultat", ranges: [ACCOUNT_RANGES.TAX] },
] as const;

export const BALANCE_SHEET_GROUPS = {
  assets: [
    { name: "Immateriella anläggningstillgångar", range: ACCOUNT_RANGES.INTANGIBLE_ASSETS },
    { name: "Materiella anläggningstillgångar", range: { start: 1100, end: 1299 } },
    { name: "Finansiella anläggningstillgångar", range: ACCOUNT_RANGES.FINANCIAL_ASSETS },
    { name: "Varulager", range: ACCOUNT_RANGES.INVENTORY },
    { name: "Kundfordringar", range: ACCOUNT_RANGES.CUSTOMER_RECEIVABLES },
    { name: "Övriga fordringar", range: ACCOUNT_RANGES.OTHER_RECEIVABLES },
    { name: "Förutbetalda kostnader", range: ACCOUNT_RANGES.PREPAID_EXPENSES },
    { name: "Kassa och bank", range: ACCOUNT_RANGES.CASH_BANK },
  ],
  equityLiabilities: [
    { name: "Eget kapital", range: ACCOUNT_RANGES.EQUITY },
    { name: "Obeskattade reserver", range: ACCOUNT_RANGES.UNTAXED_RESERVES },
    { name: "Avsättningar", range: ACCOUNT_RANGES.PROVISIONS },
    { name: "Långfristiga skulder", range: ACCOUNT_RANGES.LONG_TERM_LIABILITIES },
    { name: "Leverantörsskulder", range: ACCOUNT_RANGES.SUPPLIER_DEBTS },
    { name: "Skatteskulder", range: ACCOUNT_RANGES.TAX_LIABILITIES },
    { name: "Momsskuld", range: ACCOUNT_RANGES.VAT },
    { name: "Personalskulder", range: ACCOUNT_RANGES.PERSONNEL_LIABILITIES },
    { name: "Övriga kortfristiga skulder", range: ACCOUNT_RANGES.OTHER_CURRENT_LIABILITIES },
  ],
} as const;
