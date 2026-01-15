/**
 * NE-bilaga Calculator
 *
 * Calculates NE-bilaga field values from bookkeeping data
 * Used for Swedish sole proprietors (enskild firma) tax declaration
 */

import { db } from "@/lib/db";
import {
  journalEntries,
  journalEntryLines,
  fiscalPeriods,
  workspaces,
  nebilagaEntries,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  BALANCE_FIELD_MAPPINGS,
  INCOME_FIELD_MAPPINGS,
  TAX_ADJUSTMENT_FIELDS,
  isAccountInFieldRange,
} from "@/lib/consts/nebilaga-mappings";
import type {
  NebilagaData,
  NebilagaBalanceField,
  NebilagaIncomeField,
  NebilagaTaxAdjustmentField,
  NebilagaFieldMapping,
} from "@/lib/validations/nebilaga";
import { decrypt } from "@/lib/utils/encryption";

interface AccountBalance {
  accountNumber: number;
  accountName: string;
  debitSum: number;
  creditSum: number;
  balance: number; // debit - credit for assets, credit - debit for liabilities
}


/**
 * Get account balances for a fiscal period
 * Returns all account balances within the period
 */
export async function getAccountBalances(
  workspaceId: string,
  fiscalPeriodId: string
): Promise<AccountBalance[]> {
  // Get fiscal period dates
  const period = await db.query.fiscalPeriods.findFirst({
    where: eq(fiscalPeriods.id, fiscalPeriodId),
  });

  if (!period) {
    throw new Error("Fiscal period not found");
  }

  // Query all journal entry lines for the period, grouped by account
  const balances = await db
    .select({
      accountNumber: journalEntryLines.accountNumber,
      accountName: journalEntryLines.accountName,
      debitSum: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)::numeric`,
      creditSum: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)::numeric`,
    })
    .from(journalEntryLines)
    .innerJoin(
      journalEntries,
      eq(journalEntryLines.journalEntryId, journalEntries.id)
    )
    .where(
      and(
        eq(journalEntries.workspaceId, workspaceId),
        eq(journalEntries.fiscalPeriodId, fiscalPeriodId)
      )
    )
    .groupBy(journalEntryLines.accountNumber, journalEntryLines.accountName);

  return balances.map((b) => ({
    accountNumber: b.accountNumber,
    accountName: b.accountName,
    debitSum: Number(b.debitSum) * 100, // Convert to öre
    creditSum: Number(b.creditSum) * 100, // Convert to öre
    balance: (Number(b.debitSum) - Number(b.creditSum)) * 100, // Net balance in öre
  }));
}

/**
 * Calculate balance sheet field values (B1-B16)
 */
export function calculateBalanceFields(
  accountBalances: AccountBalance[]
): NebilagaBalanceField[] {
  return BALANCE_FIELD_MAPPINGS.map((mapping) => {
    // Sum balances for accounts in this field's ranges
    const relevantAccounts = accountBalances.filter((ab) =>
      isAccountInFieldRange(ab.accountNumber, mapping.accountRanges)
    );

    // For assets: positive balance = debit > credit (normal)
    // For liabilities/equity: positive balance = credit > debit (normal)
    let value: number;
    if (mapping.isAsset) {
      // Assets: sum of (debit - credit), should be positive
      value = relevantAccounts.reduce((sum, ab) => sum + ab.balance, 0);
    } else {
      // Liabilities/equity: sum of (credit - debit), negate the balance
      value = relevantAccounts.reduce((sum, ab) => sum - ab.balance, 0);
    }

    return {
      field: mapping.field,
      nameSv: mapping.nameSv,
      value: Math.round(value),
      isNegative: mapping.isAsset ? value < 0 : false, // Warn if asset is negative
    };
  });
}

/**
 * Calculate income statement field values (R1-R11)
 */
export function calculateIncomeFields(
  accountBalances: AccountBalance[]
): {
  incomeFields: NebilagaIncomeField[];
  r10OtherFinancial: number;
  r11BookedResult: number;
  totalRevenue: number;
  totalExpenses: number;
} {
  const incomeFields: NebilagaIncomeField[] = INCOME_FIELD_MAPPINGS.map(
    (mapping) => {
      const relevantAccounts = accountBalances.filter((ab) =>
        isAccountInFieldRange(ab.accountNumber, mapping.accountRanges)
      );

      // For revenue: credit - debit (credit is positive)
      // For expenses: debit - credit (debit is positive)
      let value: number;
      if (mapping.isRevenue) {
        value = relevantAccounts.reduce((sum, ab) => sum - ab.balance, 0);
      } else {
        value = relevantAccounts.reduce((sum, ab) => sum + ab.balance, 0);
      }

      return {
        field: mapping.field,
        nameSv: mapping.nameSv,
        value: Math.round(value),
      };
    }
  );

  // Calculate R10 (Other financial items)
  // Account ranges 8000-8299, 8500-8999 (excluding already mapped ranges)
  const r10Accounts = accountBalances.filter((ab) => {
    const acc = ab.accountNumber;
    // Financial accounts not already mapped
    return (
      (acc >= 8000 && acc <= 8299) || // Financial income (excl 8300-8399 = R4)
      (acc >= 8500 && acc <= 8999) // Financial expenses (excl 8400-8499 = R8)
    );
  });
  const r10OtherFinancial = Math.round(
    r10Accounts.reduce((sum, ab) => sum - ab.balance, 0)
  );

  // Calculate totals
  const totalRevenue =
    incomeFields
      .filter((f) => ["R1", "R2", "R3", "R4"].includes(f.field))
      .reduce((sum, f) => sum + f.value, 0) + Math.max(0, r10OtherFinancial);

  const totalExpenses =
    incomeFields
      .filter((f) => ["R5", "R6", "R7", "R8", "R9"].includes(f.field))
      .reduce((sum, f) => sum + f.value, 0) + Math.max(0, -r10OtherFinancial);

  // R11 = Total revenue - Total expenses
  const r11BookedResult = totalRevenue - totalExpenses;

  return {
    incomeFields,
    r10OtherFinancial,
    r11BookedResult,
    totalRevenue,
    totalExpenses,
  };
}

/**
 * Calculate tax adjustment fields with saved values
 */
export function calculateTaxAdjustments(
  r11BookedResult: number,
  savedAdjustments: Record<string, number>
): {
  taxAdjustments: NebilagaTaxAdjustmentField[];
  r12BookedResult: number;
  r17CombinedResult: number;
  r33PeriodiseringsfondBasis: number;
  r35ExpansionsfondBasis: number;
  r47Surplus: number;
  r48Deficit: number;
} {
  const get = (key: string): number => savedAdjustments[key] ?? 0;

  // R12 = R11 (bokfört resultat)
  const r12BookedResult = r11BookedResult;

  // R17 = R12 + R13 - R14 + R15 - R16
  const r17CombinedResult =
    r12BookedResult + get("r13") - get("r14") + get("r15") - get("r16");

  // Intermediate sum after R17-R32
  const sumR17ToR32 =
    r17CombinedResult -
    get("r18") +
    get("r19") +
    get("r20") -
    get("r21") -
    get("r22") +
    get("r23") +
    get("r24") +
    get("r25") +
    get("r26") +
    get("r27") -
    get("r28") -
    get("r29") +
    get("r30") +
    get("r31") +
    get("r32");

  // R33 = Sum of R12-R32 (basis for periodiseringsfond)
  const r33PeriodiseringsfondBasis = sumR17ToR32;

  // R35 = Sum of R12-R34 (basis for expansionsfond)
  const r35ExpansionsfondBasis = r33PeriodiseringsfondBasis - get("r34");

  // Final result after all adjustments
  const finalResult =
    r35ExpansionsfondBasis -
    get("r36") -
    get("r37") +
    get("r38") -
    get("r39") +
    get("r40") +
    get("r41") -
    get("r42");

  // R47 = Surplus (positive result)
  // R48 = Deficit (negative result)
  const r47Surplus = finalResult > 0 ? finalResult : 0;
  const r48Deficit = finalResult < 0 ? Math.abs(finalResult) : 0;

  // Build tax adjustment fields with values
  const taxAdjustments: NebilagaTaxAdjustmentField[] = TAX_ADJUSTMENT_FIELDS.map(
    (field) => {
      let value: number;

      switch (field.field) {
        case "R12":
          value = r12BookedResult;
          break;
        case "R17":
          value = r17CombinedResult;
          break;
        case "R33":
          value = r33PeriodiseringsfondBasis;
          break;
        case "R35":
          value = r35ExpansionsfondBasis;
          break;
        case "R47":
          value = r47Surplus;
          break;
        case "R48":
          value = r48Deficit;
          break;
        default:
          // Manual fields - get from saved adjustments
          value = get(field.field.toLowerCase());
      }

      return {
        field: field.field,
        nameSv: field.nameSv,
        value,
        type: field.type,
        description: field.description,
      };
    }
  );

  return {
    taxAdjustments,
    r12BookedResult,
    r17CombinedResult,
    r33PeriodiseringsfondBasis,
    r35ExpansionsfondBasis,
    r47Surplus,
    r48Deficit,
  };
}

/**
 * Get full NE-bilaga data for a fiscal period
 */
export async function calculateNebilagaData(
  workspaceId: string,
  fiscalPeriodId: string
): Promise<NebilagaData> {
  // Get workspace and fiscal period
  const [workspace, period] = await Promise.all([
    db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    }),
    db.query.fiscalPeriods.findFirst({
      where: eq(fiscalPeriods.id, fiscalPeriodId),
    }),
  ]);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (!period) {
    throw new Error("Fiscal period not found");
  }

  // Get saved NE-bilaga adjustments
  const savedEntry = await db.query.nebilagaEntries.findFirst({
    where: and(
      eq(nebilagaEntries.workspaceId, workspaceId),
      eq(nebilagaEntries.fiscalPeriodId, fiscalPeriodId)
    ),
  });

  // Build saved adjustments map
  const savedAdjustments: Record<string, number> = {};
  if (savedEntry) {
    const fields = [
      "r13", "r14", "r15", "r16", "r18", "r19", "r20",
      "r21", "r22", "r23", "r24", "r25", "r26", "r27", "r28", "r29", "r30", "r31", "r32",
      "r34", "r36", "r37", "r38", "r39", "r40", "r41", "r42", "r43", "r44", "r45", "r46",
    ];
    for (const field of fields) {
      const value = savedEntry[field as keyof typeof savedEntry];
      if (typeof value === "number") {
        savedAdjustments[field] = value;
      }
    }
  }

  // Get account balances
  const accountBalances = await getAccountBalances(workspaceId, fiscalPeriodId);

  // Calculate balance sheet fields
  const balanceFields = calculateBalanceFields(accountBalances);
  const totalAssets = balanceFields
    .filter((f) => ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"].includes(f.field))
    .reduce((sum, f) => sum + f.value, 0);
  const totalLiabilities = balanceFields
    .filter((f) => ["B11", "B12", "B13", "B14", "B15", "B16"].includes(f.field))
    .reduce((sum, f) => sum + f.value, 0);

  // Calculate income statement fields
  const {
    incomeFields,
    r10OtherFinancial,
    r11BookedResult,
    totalRevenue,
    totalExpenses,
  } = calculateIncomeFields(accountBalances);

  // Calculate tax adjustments
  const {
    taxAdjustments,
    r12BookedResult,
    r17CombinedResult,
    r33PeriodiseringsfondBasis,
    r35ExpansionsfondBasis,
    r47Surplus,
    r48Deficit,
  } = calculateTaxAdjustments(r11BookedResult, savedAdjustments);

  // Check for negative balances
  const negativeBalanceFields = balanceFields
    .filter((f) => f.isNegative)
    .map((f) => f.field);

  // Decrypt owner personal number if present
  let ownerPersonalNumber: string | null = null;
  if (workspace.ownerPersonalNumber) {
    try {
      ownerPersonalNumber = decrypt(workspace.ownerPersonalNumber);
    } catch {
      // If decryption fails, leave as null
    }
  }

  return {
    workspaceId,
    fiscalPeriodId,
    periodLabel: period.label,
    startDate: period.startDate,
    endDate: period.endDate,

    orgName: workspace.orgName,
    orgNumber: workspace.orgNumber,
    ownerPersonalNumber,
    address: workspace.address,
    postalCode: workspace.postalCode,
    city: workspace.city,

    balanceFields,
    totalAssets,
    totalLiabilities,

    incomeFields,
    totalRevenue,
    totalExpenses,
    r10OtherFinancial,
    r11BookedResult,

    taxAdjustments,

    r12BookedResult,
    r17CombinedResult,
    r33PeriodiseringsfondBasis,
    r35ExpansionsfondBasis,
    r47Surplus,
    r48Deficit,

    hasNegativeBalances: negativeBalanceFields.length > 0,
    negativeBalanceFields,
  };
}

/**
 * Get field mapping details (which accounts/verifications contributed)
 */
export async function getFieldMappingDetails(
  workspaceId: string,
  fiscalPeriodId: string,
  field: string
): Promise<NebilagaFieldMapping> {
  // Get fiscal period
  const period = await db.query.fiscalPeriods.findFirst({
    where: eq(fiscalPeriods.id, fiscalPeriodId),
  });

  if (!period) {
    throw new Error("Fiscal period not found");
  }

  // Determine field type and get account ranges
  let accountRanges: [number, number][] = [];
  const balanceMapping = BALANCE_FIELD_MAPPINGS.find((m) => m.field === field);
  const incomeMapping = INCOME_FIELD_MAPPINGS.find((m) => m.field === field);

  if (balanceMapping) {
    accountRanges = balanceMapping.accountRanges;
  } else if (incomeMapping) {
    accountRanges = incomeMapping.accountRanges;
  }

  if (accountRanges.length === 0) {
    return {
      field,
      accounts: [],
      verifications: [],
      openingBalance: 0,
    };
  }

  // Build WHERE conditions for account ranges
  const rangeConditions = accountRanges.map(
    ([start, end]) =>
      sql`${journalEntryLines.accountNumber} BETWEEN ${start} AND ${end}`
  );
  const accountRangeCondition =
    rangeConditions.length === 1
      ? rangeConditions[0]
      : sql`(${sql.join(rangeConditions, sql` OR `)})`;

  // Get account balances
  const accountBalances = await db
    .select({
      accountNumber: journalEntryLines.accountNumber,
      accountName: journalEntryLines.accountName,
      debitSum: sql<number>`COALESCE(SUM(${journalEntryLines.debit}), 0)::numeric`,
      creditSum: sql<number>`COALESCE(SUM(${journalEntryLines.credit}), 0)::numeric`,
    })
    .from(journalEntryLines)
    .innerJoin(
      journalEntries,
      eq(journalEntryLines.journalEntryId, journalEntries.id)
    )
    .where(
      and(
        eq(journalEntries.workspaceId, workspaceId),
        eq(journalEntries.fiscalPeriodId, fiscalPeriodId),
        accountRangeCondition
      )
    )
    .groupBy(journalEntryLines.accountNumber, journalEntryLines.accountName);

  // Get verification details
  const verifications = await db
    .select({
      verificationNumber: journalEntries.verificationNumber,
      description: journalEntries.description,
      accountNumber: journalEntryLines.accountNumber,
      debit: journalEntryLines.debit,
      credit: journalEntryLines.credit,
      date: journalEntries.entryDate,
    })
    .from(journalEntryLines)
    .innerJoin(
      journalEntries,
      eq(journalEntryLines.journalEntryId, journalEntries.id)
    )
    .where(
      and(
        eq(journalEntries.workspaceId, workspaceId),
        eq(journalEntries.fiscalPeriodId, fiscalPeriodId),
        accountRangeCondition
      )
    )
    .orderBy(journalEntries.verificationNumber);

  // Calculate opening balance (sum of opening_balance entries)
  const openingBalanceResult = await db
    .select({
      balance: sql<number>`COALESCE(SUM(${journalEntryLines.debit}) - SUM(${journalEntryLines.credit}), 0)::numeric`,
    })
    .from(journalEntryLines)
    .innerJoin(
      journalEntries,
      eq(journalEntryLines.journalEntryId, journalEntries.id)
    )
    .where(
      and(
        eq(journalEntries.workspaceId, workspaceId),
        eq(journalEntries.fiscalPeriodId, fiscalPeriodId),
        eq(journalEntries.entryType, "opening_balance"),
        accountRangeCondition
      )
    );

  return {
    field,
    accounts: accountBalances.map((ab) => ({
      accountNumber: ab.accountNumber,
      accountName: ab.accountName,
      balance: Math.round((Number(ab.debitSum) - Number(ab.creditSum)) * 100),
    })),
    verifications: verifications.map((v) => ({
      verificationNumber: v.verificationNumber,
      description: v.description,
      accountNumber: v.accountNumber,
      amount: Math.round(
        (Number(v.debit ?? 0) - Number(v.credit ?? 0)) * 100
      ),
      date: v.date,
    })),
    openingBalance: Math.round(Number(openingBalanceResult[0]?.balance ?? 0) * 100),
  };
}
