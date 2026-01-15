import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "../init";
import { logAudit } from "../audit";
import { bankAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Input schemas
const createBankAccountSchema = z.object({
  accountNumber: z.number().int().min(1000).max(9999),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const updateBankAccountSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// Procedures
export const listBankAccounts = authenticatedProcedure.handler(
  async ({ context }) => {
    const accounts = await context.db.query.bankAccounts.findMany({
      where: eq(bankAccounts.workspaceId, context.workspaceId),
      orderBy: (accs, { asc }) => [asc(accs.sortOrder)],
    });

    return {
      items: accounts,
      total: accounts.length,
    };
  }
);

export const getBankAccount = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const account = await context.db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.id, input.id),
        eq(bankAccounts.workspaceId, context.workspaceId)
      ),
    });

    if (!account) {
      throw new ORPCError("NOT_FOUND", { message: "Bank account not found" });
    }

    return account;
  });

export const createBankAccount = authenticatedProcedure
  .input(createBankAccountSchema)
  .handler(async ({ context, input }) => {
    // Check for duplicate account number
    const existing = await context.db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.workspaceId, context.workspaceId),
        eq(bankAccounts.accountNumber, input.accountNumber)
      ),
    });

    if (existing) {
      throw new ORPCError("CONFLICT", {
        message: "An account with this number already exists",
      });
    }

    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await context.db
        .update(bankAccounts)
        .set({ isDefault: false })
        .where(eq(bankAccounts.workspaceId, context.workspaceId));
    }

    const [account] = await context.db
      .insert(bankAccounts)
      .values({
        workspaceId: context.workspaceId,
        accountNumber: input.accountNumber,
        name: input.name,
        description: input.description || null,
        isDefault: input.isDefault || false,
        sortOrder: input.sortOrder || 0,
      })
      .returning();

    await logAudit({
      workspaceId: context.workspaceId,
      action: "create",
      entityType: "bank_account",
      entityId: account.id,
      changes: { account },
    });

    return account;
  });

export const updateBankAccount = authenticatedProcedure
  .input(updateBankAccountSchema)
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.id, input.id),
        eq(bankAccounts.workspaceId, context.workspaceId)
      ),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Bank account not found" });
    }

    // If setting as default, unset other defaults
    if (input.isDefault) {
      await context.db
        .update(bankAccounts)
        .set({ isDefault: false })
        .where(eq(bankAccounts.workspaceId, context.workspaceId));
    }

    const [updated] = await context.db
      .update(bankAccounts)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(bankAccounts.id, input.id))
      .returning();

    await logAudit({
      workspaceId: context.workspaceId,
      action: "update",
      entityType: "bank_account",
      entityId: input.id,
      changes: { before: existing, after: updated },
    });

    return updated;
  });

export const deleteBankAccount = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.id, input.id),
        eq(bankAccounts.workspaceId, context.workspaceId)
      ),
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Bank account not found" });
    }

    await context.db.delete(bankAccounts).where(eq(bankAccounts.id, input.id));

    await logAudit({
      workspaceId: context.workspaceId,
      action: "delete",
      entityType: "bank_account",
      entityId: input.id,
      changes: { deleted: existing },
    });

    return { success: true };
  });
