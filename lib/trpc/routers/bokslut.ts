import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import {
  annualClosings,
  fiscalPeriods,
  journalEntries,
  journalEntryLines,
} from "@/lib/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { ACCOUNT_RANGES } from "@/lib/utils/account-ranges";

const CORPORATE_TAX_RATE = 0.206; // 20.6% for AB (from 2021)

export const bokslutRouter = router({
  // Get or initialize annual closing for a fiscal period
  getClosing: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      let closing = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
          eq(annualClosings.workspaceId, ctx.workspaceId)
        ),
        with: {
          reconciliationUser: true,
          finalizedByUser: true,
        },
      });

      // Create closing record if it doesn't exist (with conflict handling for concurrent requests)
      if (!closing) {
        const [newClosing] = await ctx.db
          .insert(annualClosings)
          .values({
            workspaceId: ctx.workspaceId,
            fiscalPeriodId: input.fiscalPeriodId,
            status: "not_started",
          })
          .onConflictDoNothing({
            target: [annualClosings.workspaceId, annualClosings.fiscalPeriodId],
          })
          .returning();

        if (newClosing) {
          closing = {
            ...newClosing,
            reconciliationUser: null,
            finalizedByUser: null,
          };
        } else {
          // Another request created it, fetch the existing one
          closing = await ctx.db.query.annualClosings.findFirst({
            where: and(
              eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
              eq(annualClosings.workspaceId, ctx.workspaceId)
            ),
            with: {
              reconciliationUser: true,
              finalizedByUser: true,
            },
          });
        }
      }

      return {
        closing,
        period,
      };
    }),

  // Get reconciliation status for step 1
  getReconciliationStatus: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get all accounts with balances from journal entries
      const balances = await ctx.db
        .select({
          accountNumber: journalEntryLines.accountNumber,
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
          )
        )
        .groupBy(journalEntryLines.accountNumber);

      // Count accounts per category
      const accountSummary = {
        assets: 0,
        liabilities: 0,
        equity: 0,
        revenue: 0,
        expenses: 0,
        totalAccounts: balances.length,
      };

      for (const balance of balances) {
        const num = balance.accountNumber;
        if (num >= ACCOUNT_RANGES.ASSETS.start && num <= ACCOUNT_RANGES.ASSETS.end) {
          accountSummary.assets++;
        } else if (
          num >= ACCOUNT_RANGES.EQUITY_LIABILITIES.start &&
          num <= ACCOUNT_RANGES.EQUITY_LIABILITIES.end
        ) {
          if (num < 2100) {
            accountSummary.equity++;
          } else {
            accountSummary.liabilities++;
          }
        } else if (num >= ACCOUNT_RANGES.REVENUE.start && num <= ACCOUNT_RANGES.REVENUE.end) {
          accountSummary.revenue++;
        } else if (num >= ACCOUNT_RANGES.EXPENSES.start && num <= ACCOUNT_RANGES.EXPENSES.end) {
          accountSummary.expenses++;
        }
      }

      // Check balance (assets = equity + liabilities)
      let totalAssets = 0;
      let totalEquityLiabilities = 0;

      for (const balance of balances) {
        const num = balance.accountNumber;
        const debit = parseFloat(balance.totalDebit);
        const credit = parseFloat(balance.totalCredit);

        if (num >= ACCOUNT_RANGES.ASSETS.start && num <= ACCOUNT_RANGES.ASSETS.end) {
          totalAssets += debit - credit;
        } else if (
          num >= ACCOUNT_RANGES.EQUITY_LIABILITIES.start &&
          num <= ACCOUNT_RANGES.EQUITY_LIABILITIES.end
        ) {
          totalEquityLiabilities += credit - debit;
        }
      }

      const isBalanced = Math.abs(totalAssets - totalEquityLiabilities) < 0.01;

      return {
        accountSummary,
        totalAssets,
        totalEquityLiabilities,
        isBalanced,
        difference: totalAssets - totalEquityLiabilities,
      };
    }),

  // Complete reconciliation step
  completeReconciliation: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const closing = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
          eq(annualClosings.workspaceId, ctx.workspaceId)
        ),
      });

      if (!closing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bokslut hittades inte" });
      }

      if (closing.status === "finalized") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte ändra ett färdigställt bokslut",
        });
      }

      // Conditional update to prevent race conditions
      const [updated] = await ctx.db
        .update(annualClosings)
        .set({
          status: "reconciliation_complete",
          reconciliationCompletedAt: new Date(),
          reconciliationCompletedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(annualClosings.id, closing.id),
            eq(annualClosings.status, "not_started")
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Status ändrades, vänligen uppdatera och försök igen",
        });
      }

      return updated;
    }),

  // Select closing package (K1, K2, K3)
  selectPackage: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
        closingPackage: z.enum(["k1", "k2", "k3"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const closing = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
          eq(annualClosings.workspaceId, ctx.workspaceId)
        ),
      });

      if (!closing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bokslut hittades inte" });
      }

      if (closing.status === "finalized") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte ändra ett färdigställt bokslut",
        });
      }

      // Explicit status validation - only allow from reconciliation_complete
      if (closing.status !== "reconciliation_complete") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: closing.status === "not_started"
            ? "Avstämningen måste slutföras först"
            : "Bokslutspaket kan endast väljas direkt efter avstämning",
        });
      }

      // Conditional update to prevent race conditions
      const [updated] = await ctx.db
        .update(annualClosings)
        .set({
          status: "package_selected",
          closingPackage: input.closingPackage,
          packageSelectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(annualClosings.id, closing.id),
            eq(annualClosings.status, "reconciliation_complete")
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Status ändrades, vänligen uppdatera och försök igen",
        });
      }

      return updated;
    }),

  // Calculate profit and tax
  calculateTax: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get revenue (3000-3999)
      const revenueResult = await ctx.db
        .select({
          total: sql<string>`COALESCE(SUM(${journalEntryLines.credit}) - SUM(${journalEntryLines.debit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            gte(journalEntryLines.accountNumber, ACCOUNT_RANGES.REVENUE.start),
            lte(journalEntryLines.accountNumber, ACCOUNT_RANGES.REVENUE.end)
          )
        );

      // Get expenses (4000-8999)
      const expenseResult = await ctx.db
        .select({
          total: sql<string>`COALESCE(SUM(${journalEntryLines.debit}) - SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
            gte(journalEntryLines.accountNumber, ACCOUNT_RANGES.EXPENSES.start),
            lte(journalEntryLines.accountNumber, ACCOUNT_RANGES.EXPENSES.end)
          )
        );

      const revenue = parseFloat(revenueResult[0]?.total || "0");
      const expenses = parseFloat(expenseResult[0]?.total || "0");
      const profitBeforeTax = revenue - expenses;
      const taxableProfit = Math.max(0, profitBeforeTax);
      const calculatedTax = taxableProfit * CORPORATE_TAX_RATE;
      const profitAfterTax = profitBeforeTax - calculatedTax;

      return {
        revenue,
        expenses,
        profitBeforeTax,
        taxableProfit,
        taxRate: CORPORATE_TAX_RATE,
        calculatedTax,
        profitAfterTax,
      };
    }),

  // Mark closing entries as created
  markClosingEntriesCreated: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const closing = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
          eq(annualClosings.workspaceId, ctx.workspaceId)
        ),
      });

      if (!closing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bokslut hittades inte" });
      }

      if (closing.status === "finalized") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte ändra ett färdigställt bokslut",
        });
      }

      if (closing.status !== "package_selected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bokslutspaket måste väljas först",
        });
      }

      // Conditional update to prevent race conditions
      const [updated] = await ctx.db
        .update(annualClosings)
        .set({
          status: "closing_entries_created",
          closingEntriesCreatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(annualClosings.id, closing.id),
            eq(annualClosings.status, "package_selected")
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Status ändrades, vänligen uppdatera och försök igen",
        });
      }

      return updated;
    }),

  // Save calculated tax
  saveTaxCalculation: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
        calculatedProfit: z.number(),
        calculatedTax: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const closing = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
          eq(annualClosings.workspaceId, ctx.workspaceId)
        ),
      });

      if (!closing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bokslut hittades inte" });
      }

      if (closing.status === "finalized") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte ändra ett färdigställt bokslut",
        });
      }

      if (closing.status !== "closing_entries_created") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bokslutsbokningar måste markeras som klara först",
        });
      }

      // Conditional update to prevent race conditions
      const [updated] = await ctx.db
        .update(annualClosings)
        .set({
          status: "tax_calculated",
          calculatedProfit: input.calculatedProfit.toFixed(2),
          calculatedTax: input.calculatedTax.toFixed(2),
          taxCalculatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(annualClosings.id, closing.id),
            eq(annualClosings.status, "closing_entries_created")
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Status ändrades, vänligen uppdatera och försök igen",
        });
      }

      return updated;
    }),

  // Finalize closing (lock period)
  finalize: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Use transaction for full atomicity - all reads and writes inside
      return await ctx.db.transaction(async (tx) => {
        // Fetch closing inside transaction
        const closing = await tx.query.annualClosings.findFirst({
          where: and(
            eq(annualClosings.fiscalPeriodId, input.fiscalPeriodId),
            eq(annualClosings.workspaceId, ctx.workspaceId)
          ),
        });

        if (!closing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Bokslut hittades inte" });
        }

        if (closing.status !== "tax_calculated") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Alla tidigare steg måste slutföras först",
          });
        }

        // Fetch period inside transaction with workspace validation
        const period = await tx.query.fiscalPeriods.findFirst({
          where: and(
            eq(fiscalPeriods.id, input.fiscalPeriodId),
            eq(fiscalPeriods.workspaceId, ctx.workspaceId)
          ),
        });

        if (!period) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
        }

        // Check if period is already locked
        if (period.isLocked) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Perioden är redan låst",
          });
        }

        // Check if period end date + 2 bank days have passed
        const periodEndDate = new Date(period.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minDate = new Date(periodEndDate);
        minDate.setDate(minDate.getDate() + 2);

        if (today < minDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Bokslutet kan färdigställas tidigast ${minDate.toLocaleDateString("sv-SE")}`,
          });
        }

        // Lock the fiscal period with conditional update to prevent double-locking
        const [lockedPeriod] = await tx
          .update(fiscalPeriods)
          .set({
            isLocked: true,
            lockedAt: new Date(),
            lockedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(fiscalPeriods.id, input.fiscalPeriodId),
              eq(fiscalPeriods.isLocked, false)
            )
          )
          .returning();

        if (!lockedPeriod) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Perioden låstes av någon annan, vänligen uppdatera",
          });
        }

        // Finalize the closing with conditional update
        const [updated] = await tx
          .update(annualClosings)
          .set({
            status: "finalized",
            finalizedAt: new Date(),
            finalizedBy: ctx.session.user.id,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(annualClosings.id, closing.id),
              eq(annualClosings.status, "tax_calculated")
            )
          )
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Status ändrades, vänligen uppdatera och försök igen",
          });
        }

        return updated;
      });
    }),
});
