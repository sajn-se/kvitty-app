import { z } from "zod";
import { tool } from "ai";
import { db } from "@/lib/db";
import {
  journalEntries,
  journalEntryLines,
  fiscalPeriods,
} from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, gte, lte, or } from "drizzle-orm";

export const searchTransactionsSchema = z.object({
  query: z.string().optional().describe("Sokterm for beskrivning"),
  dateFrom: z.string().optional().describe("Startdatum (YYYY-MM-DD)"),
  dateTo: z.string().optional().describe("Slutdatum (YYYY-MM-DD)"),
  limit: z.number().default(10).describe("Max antal resultat"),
});

export const getAccountBalanceSchema = z.object({
  accountNumber: z.number().describe("Kontonummer att hamta saldo for"),
  fiscalPeriodId: z
    .string()
    .optional()
    .describe("Rakenskapsperiod-ID (anvands aktuell om ej angiven)"),
});

export function createChatTools(workspaceId: string, fiscalPeriodId?: string) {
  return {
    searchTransactions: tool({
      description:
        "Sök efter transaktioner/verifikationer baserat på beskrivning, datum eller andra kriterier",
      parameters: searchTransactionsSchema,
      // @ts-ignore - AI SDK tool() has type inference issues with Zod schemas
      execute: async (params: z.infer<typeof searchTransactionsSchema>) => {
        const { query, dateFrom, dateTo, limit } = params;
        const conditions = [eq(journalEntries.workspaceId, workspaceId)];

        if (fiscalPeriodId) {
          conditions.push(eq(journalEntries.fiscalPeriodId, fiscalPeriodId));
        }

        if (query && query.trim()) {
          const searchTerm = `%${query.trim()}%`;
          const searchCondition = or(
            ilike(journalEntries.description, searchTerm),
            sql`CAST(${journalEntries.verificationNumber} AS TEXT) ILIKE ${searchTerm}`
          );
          if (searchCondition) {
            conditions.push(searchCondition);
          }
        }

        if (dateFrom) {
          conditions.push(gte(journalEntries.entryDate, dateFrom));
        }
        if (dateTo) {
          conditions.push(lte(journalEntries.entryDate, dateTo));
        }

        const entries = await db.query.journalEntries.findMany({
          where: and(...conditions),
          with: {
            lines: {
              orderBy: (lines, { asc }) => [asc(lines.sortOrder)],
            },
          },
          orderBy: [desc(journalEntries.entryDate)],
          limit,
        });

        if (entries.length === 0) {
          return { found: false, message: "Inga transaktioner hittades." };
        }

        return {
          found: true,
          count: entries.length,
          transactions: entries.map((entry) => ({
            id: entry.id,
            verificationNumber: `V${entry.verificationNumber}`,
            date: entry.entryDate,
            description: entry.description,
            type: entry.entryType,
            lines: entry.lines.map((line) => ({
              account: `${line.accountNumber} ${line.accountName}`,
              debit: line.debit ? parseFloat(line.debit) : 0,
              credit: line.credit ? parseFloat(line.credit) : 0,
            })),
            totalAmount: entry.lines.reduce(
              (sum, l) => sum + (l.debit ? parseFloat(l.debit) : 0),
              0
            ),
          })),
        };
      },
    }),

    getAccountBalance: tool({
      description: "Hamta saldo for ett specifikt konto inom rakenskapsperioden",
      parameters: getAccountBalanceSchema,
      // @ts-ignore - AI SDK tool() has type inference issues with Zod schemas
      execute: async (params: z.infer<typeof getAccountBalanceSchema>) => {
        const { accountNumber, fiscalPeriodId: periodId } = params;
        let targetPeriodId = periodId || fiscalPeriodId;

        if (!targetPeriodId) {
          // Get the current/latest period for this workspace
          const period = await db.query.fiscalPeriods.findFirst({
            where: eq(fiscalPeriods.workspaceId, workspaceId),
            orderBy: [desc(fiscalPeriods.startDate)],
          });

          if (!period) {
            return {
              error: true,
              message: "Ingen rakenskapsperiod hittades.",
            };
          }

          targetPeriodId = period.id;
        }

        const whereConditions = [
          eq(journalEntryLines.accountNumber, accountNumber),
          eq(journalEntries.workspaceId, workspaceId),
          eq(journalEntries.fiscalPeriodId, targetPeriodId),
        ];

        const result = await db
          .select({
            totalDebit: sql<string>`COALESCE(SUM(CAST(${journalEntryLines.debit} AS DECIMAL)), 0)`,
            totalCredit: sql<string>`COALESCE(SUM(CAST(${journalEntryLines.credit} AS DECIMAL)), 0)`,
            transactionCount: sql<number>`COUNT(DISTINCT ${journalEntries.id})`,
          })
          .from(journalEntryLines)
          .innerJoin(
            journalEntries,
            eq(journalEntryLines.journalEntryId, journalEntries.id)
          )
          .where(and(...whereConditions));

        const data = result[0];
        const totalDebit = parseFloat(data?.totalDebit || "0");
        const totalCredit = parseFloat(data?.totalCredit || "0");
        const balance = totalDebit - totalCredit;

        return {
          accountNumber,
          totalDebit,
          totalCredit,
          balance,
          transactionCount: data?.transactionCount || 0,
          balanceType: balance >= 0 ? "debet" : "kredit",
        };
      },
    }),
  };
}
