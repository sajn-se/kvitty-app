import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { router, workspaceProcedure } from "../init";
import { bankTransactions, auditLogs, bankAccounts, journalEntries, bankImportBatches } from "@/lib/db/schema";
import { eq, and, isNull, inArray, or } from "drizzle-orm";
import {
  createBankTransactionsSchema,
  updateBankTransactionSchema,
} from "@/lib/validations/bank-transaction";
import { bankTransactionModel } from "@/lib/ai";
import { parseCSV, parseOFX, detectFileFormat } from "@/lib/utils/bank-import";
import { parseSIE4, normalizeSIE4ToTransactions, filterBankAccountTransactions, isSIEFile } from "@/lib/utils/sie-import";
import { generateTransactionHash, checkExistingHashes, createHashInput } from "@/lib/utils/transaction-hash";

export const bankTransactionsRouter = router({
  list: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankAccountId: z.string().optional(),
        unmappedOnly: z.boolean().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(bankTransactions.workspaceId, ctx.workspaceId)];

      if (input.bankAccountId) {
        conditions.push(eq(bankTransactions.bankAccountId, input.bankAccountId));
      }

      if (input.unmappedOnly) {
        conditions.push(isNull(bankTransactions.mappedToJournalEntryId));
      }

      const items = await ctx.db.query.bankTransactions.findMany({
        where: and(...conditions),
        orderBy: (v, { desc }) => [desc(v.accountingDate), desc(v.createdAt)],
        with: {
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
          bankAccount: true,
          mappedToJournalEntry: true,
        },
      });

      return items;
    }),

  get: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), bankTransactionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
        with: {
          attachments: true,
          comments: {
            orderBy: (c, { desc }) => [desc(c.createdAt)],
            with: {
              createdByUser: {
                columns: { id: true, name: true, email: true },
              },
            },
          },
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
          bankAccount: true,
          mappedToJournalEntry: true,
        },
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return transaction;
    }),

  create: workspaceProcedure
    .input(createBankTransactionsSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify bank account if provided
      if (input.bankAccountId) {
        const bankAccount = await ctx.db.query.bankAccounts.findFirst({
          where: and(
            eq(bankAccounts.id, input.bankAccountId),
            eq(bankAccounts.workspaceId, ctx.workspaceId)
          ),
        });

        if (!bankAccount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid bank account",
          });
        }
      }

      const created = await ctx.db
        .insert(bankTransactions)
        .values(
          input.bankTransactions.map((v) => ({
            workspaceId: ctx.workspaceId,
            bankAccountId: input.bankAccountId || null,
            office: v.office,
            accountingDate: v.accountingDate,
            ledgerDate: v.ledgerDate,
            currencyDate: v.currencyDate,
            reference: v.reference,
            amount: v.amount?.toString(),
            bookedBalance: v.bookedBalance?.toString(),
            importedAt: input.importedAt ? new Date(input.importedAt) : null,
            createdBy: ctx.session.user.id,
          }))
        )
        .returning();

      // Create audit logs
      await ctx.db.insert(auditLogs).values(
        created.map((v) => ({
          workspaceId: ctx.workspaceId,
          userId: ctx.session.user.id,
          action: "create",
          entityType: "bank_transaction",
          entityId: v.id,
          changes: { after: v },
        }))
      );

      return created;
    }),

  update: workspaceProcedure
    .input(
      updateBankTransactionSchema.extend({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(bankTransactions)
        .set({
          office: input.office,
          accountingDate: input.accountingDate,
          ledgerDate: input.ledgerDate,
          currencyDate: input.currencyDate,
          reference: input.reference,
          amount: input.amount?.toString(),
          bookedBalance: input.bookedBalance?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(bankTransactions.id, input.bankTransactionId))
        .returning();

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "update",
        entityType: "bank_transaction",
        entityId: input.bankTransactionId,
        changes: { before: existing, after: updated },
      });

      return updated;
    }),

  delete: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), bankTransactionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(bankTransactions)
        .where(eq(bankTransactions.id, input.bankTransactionId));

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "bank_transaction",
        entityId: input.bankTransactionId,
        changes: { before: existing },
      });

      return { success: true };
    }),

  mapToJournalEntry: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
        journalEntryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bank transaction not found" });
      }

      const journalEntry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.journalEntryId),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!journalEntry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Journal entry not found" });
      }

      const [updated] = await ctx.db
        .update(bankTransactions)
        .set({
          mappedToJournalEntryId: input.journalEntryId,
          updatedAt: new Date(),
        })
        .where(eq(bankTransactions.id, input.bankTransactionId))
        .returning();

      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "update",
        entityType: "bank_transaction",
        entityId: input.bankTransactionId,
        changes: { before: transaction, after: updated },
      });

      return updated;
    }),

  unmapFromJournalEntry: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(bankTransactions)
        .set({
          mappedToJournalEntryId: null,
          updatedAt: new Date(),
        })
        .where(eq(bankTransactions.id, input.bankTransactionId))
        .returning();

      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "update",
        entityType: "bank_transaction",
        entityId: input.bankTransactionId,
        changes: { before: transaction, after: updated },
      });

      return updated;
    }),

  checkDuplicates: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        transactions: z.array(
          z.object({
            rowId: z.string(),
            accountingDate: z.string(),
            amount: z.number(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      if (input.transactions.length === 0) {
        return {};
      }

      // Build unique date+amount pairs and track which rows map to them
      const keyToRows = new Map<string, string[]>();
      for (const tx of input.transactions) {
        const key = `${tx.accountingDate}|${tx.amount.toFixed(2)}`;
        const existing = keyToRows.get(key) || [];
        existing.push(tx.rowId);
        keyToRows.set(key, existing);
      }

      // Get unique date+amount pairs for database query
      const uniquePairs = [...keyToRows.keys()].map((key) => {
        const [date, amount] = key.split("|");
        return { date, amount };
      });

      // Build OR conditions for database query
      const orConditions = uniquePairs.map((pair) =>
        and(
          eq(bankTransactions.accountingDate, pair.date),
          eq(bankTransactions.amount, pair.amount)
        )
      );

      // Query database for existing transactions matching any date+amount pair
      const existingTransactions = orConditions.length > 0
        ? await ctx.db.query.bankTransactions.findMany({
            where: and(
              eq(bankTransactions.workspaceId, ctx.workspaceId),
              or(...orConditions)
            ),
            columns: {
              id: true,
              accountingDate: true,
              amount: true,
              reference: true,
            },
            limit: 100,
          })
        : [];

      // Build result for each input row
      const results: Record<
        string,
        {
          rowId: string;
          isDuplicate: boolean;
          matches: Array<{
            transactionId: string;
            accountingDate: string;
            amount: string;
            reference: string | null;
            type: "database" | "batch";
          }>;
        }
      > = {};

      for (const tx of input.transactions) {
        const key = `${tx.accountingDate}|${tx.amount.toFixed(2)}`;
        const matches: Array<{
          transactionId: string;
          accountingDate: string;
          amount: string;
          reference: string | null;
          type: "database" | "batch";
        }> = [];

        // Check database matches
        for (const existing of existingTransactions) {
          if (
            existing.accountingDate === tx.accountingDate &&
            parseFloat(existing.amount!) === tx.amount
          ) {
            matches.push({
              transactionId: existing.id,
              accountingDate: existing.accountingDate!,
              amount: existing.amount!,
              reference: existing.reference,
              type: "database",
            });
          }
        }

        // Check intra-batch duplicates
        const batchRows = keyToRows.get(key) || [];
        if (batchRows.length > 1) {
          matches.push({
            transactionId: "",
            accountingDate: tx.accountingDate,
            amount: tx.amount.toFixed(2),
            reference: null,
            type: "batch",
          });
        }

        results[tx.rowId] = {
          rowId: tx.rowId,
          isDuplicate: matches.length > 0,
          matches,
        };
      }

      return results;
    }),

  analyzeContent: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        content: z.string().min(1).max(50000),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateObject({
        model: bankTransactionModel,
        schema: z.object({
          bankTransactions: z.array(
            z.object({
              office: z.string().nullable(),
              accountingDate: z.string().nullable(),
              reference: z.string().nullable(),
              amount: z.number().nullable(),
            })
          ),
        }),
        prompt: `Extract bank transaction data from the following content.

For each row/transaction found, extract:
- office: Account number or office code (if present)
- accountingDate: Date in YYYY-MM-DD format (if present)
- reference: Description, memo, or reference text
- amount: Numeric amount (negative for debits/expenses, positive for credits)

Return only the extracted data, no explanations.

Content to analyze:
${input.content}`,
      });

      return result.object;
    }),

  import: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankAccountId: z.string().optional(),
        fileContent: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.bankAccountId) {
        const bankAccount = await ctx.db.query.bankAccounts.findFirst({
          where: and(
            eq(bankAccounts.id, input.bankAccountId),
            eq(bankAccounts.workspaceId, ctx.workspaceId)
          ),
        });

        if (!bankAccount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid bank account",
          });
        }
      }

      const format = detectFileFormat(input.fileName, input.fileContent);
      let parsedTransactions: Array<{
        accountingDate: string;
        amount: number;
        reference: string;
        bookedBalance?: number;
      }>;

      try {
        if (format === "ofx") {
          parsedTransactions = parseOFX(input.fileContent);
        } else if (format === "csv") {
          parsedTransactions = parseCSV(input.fileContent);
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Filen måste vara CSV eller OFX format",
          });
        }
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Kunde inte parsa filen",
        });
      }

      if (parsedTransactions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inga transaktioner hittades i filen",
        });
      }

      const importedAt = new Date();
      const created = await ctx.db
        .insert(bankTransactions)
        .values(
          parsedTransactions.map((t) => ({
            workspaceId: ctx.workspaceId,
            bankAccountId: input.bankAccountId || null,
            accountingDate: t.accountingDate,
            reference: t.reference || null,
            amount: t.amount.toString(),
            bookedBalance: t.bookedBalance?.toString() || null,
            importedAt,
            createdBy: ctx.session.user.id,
          }))
        )
        .returning();

      await ctx.db.insert(auditLogs).values(
        created.map((v) => ({
          workspaceId: ctx.workspaceId,
          userId: ctx.session.user.id,
          action: "create",
          entityType: "bank_transaction",
          entityId: v.id,
          changes: { after: v, imported: true },
        }))
      );

      return { count: created.length, transactions: created };
    }),

  importSIE4: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankAccountId: z.string().optional(),
        fileContent: z.string(),
        fileName: z.string(),
        filterBankAccounts: z.boolean().optional().default(true), // Only import 1900-1999 accounts
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify bank account if provided
      if (input.bankAccountId) {
        const bankAccount = await ctx.db.query.bankAccounts.findFirst({
          where: and(
            eq(bankAccounts.id, input.bankAccountId),
            eq(bankAccounts.workspaceId, ctx.workspaceId)
          ),
        });

        if (!bankAccount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ogiltigt bankkonto",
          });
        }
      }

      // Validate file is SIE format
      if (!isSIEFile(input.fileName, input.fileContent)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Filen måste vara i SIE-format (.se, .si, .sie)",
        });
      }

      // Parse SIE4 content
      const parseResult = parseSIE4(input.fileContent);

      if (parseResult.errors.length > 0 && parseResult.verifications.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Kunde inte tolka SIE-filen: ${parseResult.errors.join(", ")}`,
        });
      }

      // Normalize to bank transactions
      let transactions = normalizeSIE4ToTransactions(parseResult);

      // Optionally filter to only bank accounts (1900-1999)
      if (input.filterBankAccounts) {
        transactions = filterBankAccountTransactions(transactions);
      }

      if (transactions.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: input.filterBankAccounts
            ? "Inga banktransaktioner (konto 1900-1999) hittades i SIE-filen"
            : "Inga transaktioner hittades i SIE-filen",
        });
      }

      // Create import batch
      const [importBatch] = await ctx.db
        .insert(bankImportBatches)
        .values({
          workspaceId: ctx.workspaceId,
          bankAccountId: input.bankAccountId || null,
          fileName: input.fileName,
          fileFormat: "sie4",
          status: "processing",
          totalTransactions: transactions.length,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Generate hashes and check for duplicates
      const transactionsWithHashes = transactions.map((t, index) => {
        const hashInput = createHashInput(t.accountingDate, t.amount, t.reference);
        return {
          ...t,
          index,
          hash: hashInput ? generateTransactionHash(hashInput) : null,
        };
      });

      // Get all valid hashes
      const validHashes = transactionsWithHashes
        .filter((t) => t.hash !== null)
        .map((t) => t.hash as string);

      // Check existing hashes
      const existingHashMap = await checkExistingHashes(ctx.workspaceId, validHashes);

      // Separate duplicates from new transactions
      const duplicateIndices = new Set<number>();
      const seenHashes = new Set<string>();

      for (const transaction of transactionsWithHashes) {
        if (transaction.hash) {
          if (existingHashMap.has(transaction.hash) || seenHashes.has(transaction.hash)) {
            duplicateIndices.add(transaction.index);
          } else {
            seenHashes.add(transaction.hash);
          }
        }
      }

      // Filter to only new transactions
      const newTransactions = transactionsWithHashes.filter(
        (t) => !duplicateIndices.has(t.index)
      );

      const duplicateCount = duplicateIndices.size;
      const importedCount = newTransactions.length;

      // Insert new transactions
      let created: typeof bankTransactions.$inferSelect[] = [];

      if (newTransactions.length > 0) {
        const importedAt = new Date();

        created = await ctx.db
          .insert(bankTransactions)
          .values(
            newTransactions.map((t) => ({
              workspaceId: ctx.workspaceId,
              bankAccountId: input.bankAccountId || null,
              importBatchId: importBatch.id,
              accountingDate: t.accountingDate,
              reference: t.reference || null,
              amount: t.amount.toString(),
              status: "pending" as const,
              hash: t.hash,
              importedAt,
              createdBy: ctx.session.user.id,
            }))
          )
          .returning();

        // Create audit logs
        await ctx.db.insert(auditLogs).values(
          created.map((v) => ({
            workspaceId: ctx.workspaceId,
            userId: ctx.session.user.id,
            action: "create",
            entityType: "bank_transaction",
            entityId: v.id,
            changes: { after: v, imported: true, source: "sie4" },
          }))
        );
      }

      // Update import batch status
      await ctx.db
        .update(bankImportBatches)
        .set({
          status: "completed",
          importedTransactions: importedCount,
          duplicateTransactions: duplicateCount,
        })
        .where(eq(bankImportBatches.id, importBatch.id));

      return {
        total: transactions.length,
        imported: importedCount,
        duplicates: duplicateCount,
        batchId: importBatch.id,
        transactions: created,
        parseErrors: parseResult.errors,
        companyName: parseResult.companyName,
        fiscalYear: parseResult.fiscalYearStart && parseResult.fiscalYearEnd
          ? { start: parseResult.fiscalYearStart, end: parseResult.fiscalYearEnd }
          : undefined,
      };
    }),

  markAsBooked: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        transactionIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify transactions exist and belong to workspace
      const existingTransactions = await ctx.db.query.bankTransactions.findMany({
        where: and(
          eq(bankTransactions.workspaceId, ctx.workspaceId),
          inArray(bankTransactions.id, input.transactionIds)
        ),
      });

      if (existingTransactions.length !== input.transactionIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "En eller flera transaktioner hittades inte",
        });
      }

      // Check that all transactions are in 'pending' status
      const invalidTransactions = existingTransactions.filter(
        (t) => t.status !== "pending"
      );

      if (invalidTransactions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Endast väntande transaktioner kan markeras som bokförda. ${invalidTransactions.length} transaktioner har redan annan status.`,
        });
      }

      // Update status to 'booked'
      const updated = await ctx.db
        .update(bankTransactions)
        .set({
          status: "booked",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(bankTransactions.workspaceId, ctx.workspaceId),
            inArray(bankTransactions.id, input.transactionIds)
          )
        )
        .returning();

      // Create audit logs
      await ctx.db.insert(auditLogs).values(
        updated.map((v) => ({
          workspaceId: ctx.workspaceId,
          userId: ctx.session.user.id,
          action: "update",
          entityType: "bank_transaction",
          entityId: v.id,
          changes: { statusChange: { from: "pending", to: "booked" } },
        }))
      );

      return {
        updated: updated.length,
        transactions: updated,
      };
    }),

  markAsIgnored: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        transactionIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify transactions exist and belong to workspace
      const existingTransactions = await ctx.db.query.bankTransactions.findMany({
        where: and(
          eq(bankTransactions.workspaceId, ctx.workspaceId),
          inArray(bankTransactions.id, input.transactionIds)
        ),
      });

      if (existingTransactions.length !== input.transactionIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "En eller flera transaktioner hittades inte",
        });
      }

      // Check that all transactions are in 'pending' or 'matched' status
      const invalidTransactions = existingTransactions.filter(
        (t) => t.status !== "pending" && t.status !== "matched"
      );

      if (invalidTransactions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Endast väntande eller matchade transaktioner kan ignoreras. ${invalidTransactions.length} transaktioner har annan status.`,
        });
      }

      // Update status to 'ignored'
      const updated = await ctx.db
        .update(bankTransactions)
        .set({
          status: "ignored",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(bankTransactions.workspaceId, ctx.workspaceId),
            inArray(bankTransactions.id, input.transactionIds)
          )
        )
        .returning();

      // Create audit logs
      await ctx.db.insert(auditLogs).values(
        updated.map((v) => {
          const before = existingTransactions.find((t) => t.id === v.id);
          return {
            workspaceId: ctx.workspaceId,
            userId: ctx.session.user.id,
            action: "update",
            entityType: "bank_transaction",
            entityId: v.id,
            changes: { statusChange: { from: before?.status, to: "ignored" } },
          };
        })
      );

      return {
        updated: updated.length,
        transactions: updated,
      };
    }),
});

