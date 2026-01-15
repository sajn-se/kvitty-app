import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "../init";
import { logAudit } from "../audit";
import { bankTransactions, bankAccounts } from "@/lib/db/schema";
import { eq, and, desc, count, gte, lte } from "drizzle-orm";
import { generateTransactionHash } from "@/lib/utils/transaction-hash";

// Input schemas
const createBankTransactionSchema = z.object({
  bankAccountId: z.string().optional(),
  accountNumber: z.string().optional().nullable(),
  accountingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ledgerDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  currencyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  reference: z.string(),
  amount: z.number(),
  bookedBalance: z.number().optional().nullable(),
});

const updateBankTransactionSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "matched", "booked", "ignored"]).optional(),
  reference: z.string().optional(),
  amount: z.number().optional(),
  accountingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Procedures
export const listBankTransactions = authenticatedProcedure
  .input(
    z.object({
      bankAccountId: z.string().optional(),
      status: z.enum(["pending", "matched", "booked", "ignored"]).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const conditions = [eq(bankTransactions.workspaceId, context.workspaceId)];

    if (input.bankAccountId) {
      conditions.push(eq(bankTransactions.bankAccountId, input.bankAccountId));
    }
    if (input.status) {
      conditions.push(eq(bankTransactions.status, input.status));
    }
    if (input.dateFrom) {
      conditions.push(gte(bankTransactions.accountingDate, input.dateFrom));
    }
    if (input.dateTo) {
      conditions.push(lte(bankTransactions.accountingDate, input.dateTo));
    }

    const whereClause = and(...conditions);

    const [transactions, totalResult] = await Promise.all([
      context.db.query.bankTransactions.findMany({
        where: whereClause,
        with: {
          bankAccount: true,
        },
        orderBy: [desc(bankTransactions.accountingDate)],
        limit: input.limit,
        offset: input.offset,
      }),
      context.db.select({ count: count() }).from(bankTransactions).where(whereClause),
    ]);

    return {
      items: transactions,
      total: totalResult[0]?.count ?? 0,
      limit: input.limit,
      offset: input.offset,
    };
  });

export const getBankTransaction = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const transaction = await context.db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.id, input.id),
        eq(bankTransactions.workspaceId, context.workspaceId)
      ),
      with: {
        bankAccount: true,
        mappedToJournalEntry: true,
      },
    });

    if (!transaction) {
      throw new ORPCError("NOT_FOUND", { message: "Bank transaction not found" });
    }

    return transaction;
  });

export const createBankTransaction = authenticatedProcedure
  .input(createBankTransactionSchema)
  .handler(async ({ context, input }) => {
    // Validate bank account if provided
    if (input.bankAccountId) {
      const account = await context.db.query.bankAccounts.findFirst({
        where: and(
          eq(bankAccounts.id, input.bankAccountId),
          eq(bankAccounts.workspaceId, context.workspaceId)
        ),
      });

      if (!account) {
        throw new ORPCError("NOT_FOUND", { message: "Bank account not found" });
      }
    }

    // Generate hash for duplicate detection
    const hash = generateTransactionHash({
      date: input.accountingDate,
      amount: input.amount,
      reference: input.reference,
    });

    // Check for duplicates
    const existing = await context.db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.workspaceId, context.workspaceId),
        eq(bankTransactions.hash, hash)
      ),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "Duplicate transaction detected",
        data: { existingId: existing.id },
      });
    }

    const [transaction] = await context.db
      .insert(bankTransactions)
      .values({
        workspaceId: context.workspaceId,
        bankAccountId: input.bankAccountId || null,
        accountNumber: input.accountNumber || null,
        accountingDate: input.accountingDate,
        ledgerDate: input.ledgerDate || null,
        currencyDate: input.currencyDate || null,
        reference: input.reference,
        amount: String(input.amount),
        bookedBalance: input.bookedBalance ? String(input.bookedBalance) : null,
        status: "pending",
        hash,
        createdBy: null,
      })
      .returning();

    await logAudit({
      workspaceId: context.workspaceId,
      action: "create",
      entityType: "bank_transaction",
      entityId: transaction.id,
      changes: { transaction },
    });

    return transaction;
  });

export const updateBankTransaction = authenticatedProcedure
  .input(updateBankTransactionSchema)
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.id, input.id),
        eq(bankTransactions.workspaceId, context.workspaceId)
      ),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Bank transaction not found" });
    }

    const [updated] = await context.db
      .update(bankTransactions)
      .set({
        ...(input.status && { status: input.status }),
        ...(input.reference && { reference: input.reference }),
        ...(input.amount !== undefined && { amount: String(input.amount) }),
        ...(input.accountingDate && { accountingDate: input.accountingDate }),
        updatedAt: new Date(),
      })
      .where(eq(bankTransactions.id, input.id))
      .returning();

    await logAudit({
      workspaceId: context.workspaceId,
      action: "update",
      entityType: "bank_transaction",
      entityId: input.id,
      changes: { before: existing, after: updated },
    });

    return updated;
  });

export const deleteBankTransaction = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.bankTransactions.findFirst({
      where: and(
        eq(bankTransactions.id, input.id),
        eq(bankTransactions.workspaceId, context.workspaceId)
      ),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Bank transaction not found" });
    }

    if (existing.status === "booked") {
      throw new ORPCError("BAD_REQUEST", {
        message: "Cannot delete a booked transaction",
      });
    }

    await context.db.delete(bankTransactions).where(eq(bankTransactions.id, input.id));

    await logAudit({
      workspaceId: context.workspaceId,
      action: "delete",
      entityType: "bank_transaction",
      entityId: input.id,
      changes: { deleted: existing },
    });

    return { success: true };
  });
