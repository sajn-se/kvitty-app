import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import {
  journalEntries,
  journalEntryLines,
  fiscalPeriods,
  workspaces,
} from "@/lib/db/schema";
import { eq, and, sql, gte, lte, between } from "drizzle-orm";
import {
  ACCOUNT_RANGES,
  INCOME_STATEMENT_GROUPS,
  BALANCE_SHEET_GROUPS,
  isDebitAccount,
} from "@/lib/utils/account-ranges";

// Helper to get date range for VAT period
function getVatPeriodDates(
  fiscalYearStart: string,
  fiscalYearEnd: string,
  frequency: "monthly" | "quarterly" | "yearly",
  periodIndex: number
): { start: string; end: string } {
  const startDate = new Date(fiscalYearStart);

  if (frequency === "yearly") {
    return { start: fiscalYearStart, end: fiscalYearEnd };
  }

  if (frequency === "quarterly") {
    const quarterStart = new Date(startDate);
    quarterStart.setMonth(startDate.getMonth() + periodIndex * 3);
    const quarterEnd = new Date(quarterStart);
    quarterEnd.setMonth(quarterEnd.getMonth() + 3);
    quarterEnd.setDate(quarterEnd.getDate() - 1);

    return {
      start: quarterStart.toISOString().split("T")[0],
      end: quarterEnd.toISOString().split("T")[0],
    };
  }

  // Monthly
  const monthStart = new Date(startDate);
  monthStart.setMonth(startDate.getMonth() + periodIndex);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(monthEnd.getDate() - 1);

  return {
    start: monthStart.toISOString().split("T")[0],
    end: monthEnd.toISOString().split("T")[0],
  };
}

// Helper to format VAT period label
function formatVatPeriodLabel(
  startDate: string,
  frequency: "monthly" | "quarterly" | "yearly"
): string {
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  if (frequency === "yearly") {
    return `${year}`;
  }

  if (frequency === "quarterly") {
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  }

  const monthNames = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
  ];
  return `${monthNames[month]} ${year}`;
}

// Helper to get VAT deadline
function getVatDeadline(periodEnd: string): string {
  const endDate = new Date(periodEnd);
  // VAT declaration due 26th of month after period ends (or 17th of 2nd month for small businesses)
  const deadlineDate = new Date(endDate);
  deadlineDate.setMonth(deadlineDate.getMonth() + 1);
  deadlineDate.setDate(26);
  return deadlineDate.toISOString().split("T")[0];
}

export const reportsRouter = router({
  // Income Statement (Resultatrapport)
  incomeStatement: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get period info
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      // Get all account balances for income/expense accounts (3000-8999)
      const accountBalances = await ctx.db
        .select({
          accountNumber: journalEntryLines.accountNumber,
          accountName: journalEntryLines.accountName,
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(
          journalEntries,
          eq(journalEntryLines.journalEntryId, journalEntries.id)
        )
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            sql`${journalEntryLines.accountNumber} >= 3000`,
            sql`${journalEntryLines.accountNumber} <= 8999`
          )
        )
        .groupBy(
          journalEntryLines.accountNumber,
          journalEntryLines.accountName
        )
        .orderBy(journalEntryLines.accountNumber);

      // Group accounts by income statement categories
      const groups = INCOME_STATEMENT_GROUPS.map((group) => {
        const accounts = accountBalances.filter((acc) =>
          group.ranges.some(
            (range) =>
              acc.accountNumber >= range.start && acc.accountNumber <= range.end
          )
        );

        const rows = accounts.map((acc) => {
          const debit = parseFloat(acc.totalDebit);
          const credit = parseFloat(acc.totalCredit);
          // For income accounts (3xxx), balance is credit - debit (positive = income)
          // For expense accounts (4xxx-8xxx), balance is debit - credit (positive = expense)
          const balance = isDebitAccount(acc.accountNumber)
            ? debit - credit
            : credit - debit;

          return {
            accountNumber: acc.accountNumber,
            accountName: acc.accountName,
            amount: balance,
          };
        });

        const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);

        return {
          name: group.name,
          rows,
          subtotal,
        };
      });

      // Calculate totals
      const revenue = groups
        .filter((g) =>
          ["Nettoomsättning", "Övriga rörelseintäkter"].includes(g.name)
        )
        .reduce((sum, g) => sum + g.subtotal, 0);

      const expenses = groups
        .filter(
          (g) =>
            ![
              "Nettoomsättning",
              "Övriga rörelseintäkter",
              "Skatt på årets resultat",
            ].includes(g.name)
        )
        .reduce((sum, g) => sum + g.subtotal, 0);

      const tax = groups.find((g) => g.name === "Skatt på årets resultat")?.subtotal || 0;
      const profit = revenue - expenses - tax;

      return {
        period: {
          label: period.label,
          startDate: period.startDate,
          endDate: period.endDate,
        },
        groups,
        totals: {
          revenue,
          expenses,
          tax,
          profitBeforeTax: revenue - expenses,
          profit,
        },
      };
    }),

  // Balance Sheet (Balansrapport)
  balanceSheet: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get period info
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      // Get all account balances for balance sheet accounts (1000-2999)
      const accountBalances = await ctx.db
        .select({
          accountNumber: journalEntryLines.accountNumber,
          accountName: journalEntryLines.accountName,
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(
          journalEntries,
          eq(journalEntryLines.journalEntryId, journalEntries.id)
        )
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            sql`${journalEntryLines.accountNumber} >= 1000`,
            sql`${journalEntryLines.accountNumber} <= 2999`
          )
        )
        .groupBy(
          journalEntryLines.accountNumber,
          journalEntryLines.accountName
        )
        .orderBy(journalEntryLines.accountNumber);

      // Helper to create group data
      const createGroup = (
        name: string,
        range: { start: number; end: number }
      ) => {
        const accounts = accountBalances.filter(
          (acc) =>
            acc.accountNumber >= range.start && acc.accountNumber <= range.end
        );

        const rows = accounts.map((acc) => {
          const debit = parseFloat(acc.totalDebit);
          const credit = parseFloat(acc.totalCredit);
          // Assets: balance = debit - credit
          // Liabilities/Equity: balance = credit - debit
          const balance = isDebitAccount(acc.accountNumber)
            ? debit - credit
            : credit - debit;

          return {
            accountNumber: acc.accountNumber,
            accountName: acc.accountName,
            amount: balance,
          };
        });

        const subtotal = rows.reduce((sum, row) => sum + row.amount, 0);

        return { name, rows, subtotal };
      };

      // Build asset groups
      const assetGroups = BALANCE_SHEET_GROUPS.assets.map((g) =>
        createGroup(g.name, g.range)
      );
      const totalAssets = assetGroups.reduce((sum, g) => sum + g.subtotal, 0);

      // Build equity & liability groups
      const equityLiabilityGroups = BALANCE_SHEET_GROUPS.equityLiabilities.map(
        (g) => createGroup(g.name, g.range)
      );
      const totalEquityLiabilities = equityLiabilityGroups.reduce(
        (sum, g) => sum + g.subtotal,
        0
      );

      return {
        period: {
          label: period.label,
          startDate: period.startDate,
          endDate: period.endDate,
        },
        assets: {
          groups: assetGroups,
          total: totalAssets,
        },
        equityLiabilities: {
          groups: equityLiabilityGroups,
          total: totalEquityLiabilities,
        },
        isBalanced: Math.abs(totalAssets - totalEquityLiabilities) < 0.01,
      };
    }),

  // VAT Report (Momsrapport)
  vatReport: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
        periodIndex: z.number().min(0).max(11),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get workspace for VAT reporting frequency
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Arbetsyta hittades inte" });
      }

      // Get fiscal period
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      const frequency = workspace.vatReportingFrequency || "quarterly";
      const { start, end } = getVatPeriodDates(
        period.startDate,
        period.endDate,
        frequency,
        input.periodIndex
      );

      // Get VAT account balances for the period
      const vatBalances = await ctx.db
        .select({
          accountNumber: journalEntryLines.accountNumber,
          accountName: journalEntryLines.accountName,
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(
          journalEntries,
          eq(journalEntryLines.journalEntryId, journalEntries.id)
        )
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            sql`${journalEntries.entryDate} >= ${start}`,
            sql`${journalEntries.entryDate} <= ${end}`,
            sql`${journalEntryLines.accountNumber} >= 2610`,
            sql`${journalEntryLines.accountNumber} <= 2699`
          )
        )
        .groupBy(
          journalEntryLines.accountNumber,
          journalEntryLines.accountName
        )
        .orderBy(journalEntryLines.accountNumber);

      // Also get sales amounts for VAT base calculation
      const salesBalances = await ctx.db
        .select({
          vatCode: journalEntryLines.vatCode,
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(
          journalEntries,
          eq(journalEntryLines.journalEntryId, journalEntries.id)
        )
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            sql`${journalEntries.entryDate} >= ${start}`,
            sql`${journalEntries.entryDate} <= ${end}`,
            sql`${journalEntryLines.accountNumber} >= 3000`,
            sql`${journalEntryLines.accountNumber} <= 3999`
          )
        )
        .groupBy(journalEntryLines.vatCode);

      // Calculate output VAT (utgående moms)
      const outputVat25 = vatBalances
        .filter(
          (acc) => acc.accountNumber >= 2610 && acc.accountNumber <= 2619
        )
        .reduce(
          (sum, acc) =>
            sum + (parseFloat(acc.totalCredit) - parseFloat(acc.totalDebit)),
          0
        );

      const outputVat12 = vatBalances
        .filter(
          (acc) => acc.accountNumber >= 2620 && acc.accountNumber <= 2629
        )
        .reduce(
          (sum, acc) =>
            sum + (parseFloat(acc.totalCredit) - parseFloat(acc.totalDebit)),
          0
        );

      const outputVat6 = vatBalances
        .filter(
          (acc) => acc.accountNumber >= 2630 && acc.accountNumber <= 2639
        )
        .reduce(
          (sum, acc) =>
            sum + (parseFloat(acc.totalCredit) - parseFloat(acc.totalDebit)),
          0
        );

      // Calculate input VAT (ingående moms)
      const inputVat = vatBalances
        .filter(
          (acc) => acc.accountNumber >= 2640 && acc.accountNumber <= 2649
        )
        .reduce(
          (sum, acc) =>
            sum + (parseFloat(acc.totalDebit) - parseFloat(acc.totalCredit)),
          0
        );

      const totalOutputVat = outputVat25 + outputVat12 + outputVat6;
      const netVat = totalOutputVat - inputVat;

      return {
        period: {
          label: formatVatPeriodLabel(start, frequency),
          startDate: start,
          endDate: end,
        },
        fiscalPeriod: {
          label: period.label,
          isLocked: period.isLocked,
        },
        frequency,
        outputVat: {
          vat25: outputVat25,
          vat12: outputVat12,
          vat6: outputVat6,
          total: totalOutputVat,
        },
        inputVat,
        netVat,
        deadline: getVatDeadline(end),
        payment: {
          bankgiro: "5050-1055",
          recipient: "Skatteverket",
        },
      };
    }),

  // List all VAT periods for a fiscal year
  vatPeriods: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get workspace for VAT reporting frequency
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Arbetsyta hittades inte" });
      }

      // Get fiscal period
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      const frequency = workspace.vatReportingFrequency || "quarterly";
      const periodCount =
        frequency === "yearly" ? 1 : frequency === "quarterly" ? 4 : 12;

      const periods = [];
      for (let i = 0; i < periodCount; i++) {
        const { start, end } = getVatPeriodDates(
          period.startDate,
          period.endDate,
          frequency,
          i
        );

        // Check if period end is in the past
        const isPast = new Date(end) < new Date();

        periods.push({
          index: i,
          label: formatVatPeriodLabel(start, frequency),
          startDate: start,
          endDate: end,
          deadline: getVatDeadline(end),
          isPast,
        });
      }

      return periods;
    }),
});
