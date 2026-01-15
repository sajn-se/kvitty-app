import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "../init";
import { logAudit } from "../audit";
import {
  journalEntries,
  journalEntryLines,
  fiscalPeriods,
  type JournalEntryLine,
} from "@/lib/db/schema";
import { eq, and, desc, sql, count, gte, lte } from "drizzle-orm";

// Input schemas
const journalEntryLineSchema = z.object({
  accountNumber: z.number().int().min(1000).max(9999),
  accountName: z.string().min(1),
  debit: z.number().min(0).optional().nullable(),
  credit: z.number().min(0).optional().nullable(),
  description: z.string().max(500).optional(),
  vatCode: z.enum(["25", "12", "6", "0"]).optional().nullable(),
});

const journalEntryTypes = [
  "kvitto",
  "inkomst",
  "leverantorsfaktura",
  "lon",
  "utlagg",
  "annat",
] as const;

const createJournalEntrySchema = z
  .object({
    fiscalPeriodId: z.string(),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    description: z.string().min(1).max(500),
    entryType: z.enum(journalEntryTypes),
    sourceType: z.enum(["manual", "ai_assisted", "payroll", "bank_import"]).optional(),
    lines: z.array(journalEntryLineSchema).min(2, "At least 2 lines required"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    { message: "Debit and credit must balance", path: ["lines"] }
  );

const updateJournalEntrySchema = z
  .object({
    id: z.string(),
    entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    description: z.string().min(1).max(500).optional(),
    entryType: z.enum(journalEntryTypes).optional(),
    lines: z.array(journalEntryLineSchema).min(2).optional(),
  })
  .refine(
    (data) => {
      // Only validate balance if lines are provided
      if (!data.lines) return true;
      const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    { message: "Debit and credit must balance", path: ["lines"] }
  );

// Procedures
export const listJournalEntries = authenticatedProcedure
  .input(
    z.object({
      fiscalPeriodId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })
  )
  .handler(async ({ context, input }) => {
    const conditions = [
      eq(journalEntries.workspaceId, context.workspaceId),
      eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
    ];

    if (input.dateFrom) {
      conditions.push(gte(journalEntries.entryDate, input.dateFrom));
    }
    if (input.dateTo) {
      conditions.push(lte(journalEntries.entryDate, input.dateTo));
    }

    const whereClause = and(...conditions);

    const [entries, totalResult] = await Promise.all([
      context.db.query.journalEntries.findMany({
        where: whereClause,
        with: {
          lines: true,
        },
        orderBy: [desc(journalEntries.verificationNumber)],
        limit: input.limit,
        offset: input.offset,
      }),
      context.db.select({ count: count() }).from(journalEntries).where(whereClause),
    ]);

    return {
      items: entries,
      total: totalResult[0]?.count ?? 0,
      limit: input.limit,
      offset: input.offset,
    };
  });

export const getJournalEntry = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const entry = await context.db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, input.id),
        eq(journalEntries.workspaceId, context.workspaceId)
      ),
      with: {
        lines: true,
        fiscalPeriod: true,
      },
    });

    if (!entry) {
      throw new ORPCError("NOT_FOUND", { message: "Journal entry not found" });
    }

    return entry;
  });

export const createJournalEntry = authenticatedProcedure
  .input(createJournalEntrySchema)
  .handler(async ({ context, input }) => {
    // Check if the fiscal period exists and is not locked
    const period = await context.db.query.fiscalPeriods.findFirst({
      where: and(
        eq(fiscalPeriods.id, input.fiscalPeriodId),
        eq(fiscalPeriods.workspaceId, context.workspaceId)
      ),
    });

    if (!period) {
      throw new ORPCError("NOT_FOUND", { message: "Fiscal period not found" });
    }

    if (period.isLocked) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Fiscal period ${period.label} is locked`,
      });
    }

    // Get next verification number
    const nextNumber = await context.db
      .select({ maxNumber: sql<number>`MAX(${journalEntries.verificationNumber})` })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.workspaceId, context.workspaceId),
          eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
        )
      );

    const verificationNumber = (nextNumber[0]?.maxNumber || 0) + 1;

    // Create the journal entry
    const [entry] = await context.db
      .insert(journalEntries)
      .values({
        workspaceId: context.workspaceId,
        fiscalPeriodId: input.fiscalPeriodId,
        verificationNumber,
        entryDate: input.entryDate,
        description: input.description,
        entryType: input.entryType,
        sourceType: input.sourceType || "manual",
        createdBy: null, // API doesn't have a user
      })
      .returning();

    // Create the entry lines
    const lines = await context.db
      .insert(journalEntryLines)
      .values(
        input.lines.map((line, index) => ({
          journalEntryId: entry.id,
          accountNumber: line.accountNumber,
          accountName: line.accountName,
          debit: line.debit ? String(line.debit) : null,
          credit: line.credit ? String(line.credit) : null,
          description: line.description || null,
          vatCode: line.vatCode || null,
          sortOrder: index,
        }))
      )
      .returning();

    await logAudit({
      workspaceId: context.workspaceId,
      action: "create",
      entityType: "journal_entry",
      entityId: entry.id,
      changes: { entry, lines },
    });

    return { ...entry, lines };
  });

export const updateJournalEntry = authenticatedProcedure
  .input(updateJournalEntrySchema)
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, input.id),
        eq(journalEntries.workspaceId, context.workspaceId)
      ),
      with: {
        lines: true,
        fiscalPeriod: true,
      },
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Journal entry not found" });
    }

    if (existing.isLocked) {
      throw new ORPCError("BAD_REQUEST", { message: "Journal entry is locked" });
    }

    if (existing.fiscalPeriod?.isLocked) {
      throw new ORPCError("BAD_REQUEST", { message: "Fiscal period is locked" });
    }

    // Update the entry
    const [updated] = await context.db
      .update(journalEntries)
      .set({
        ...(input.entryDate && { entryDate: input.entryDate }),
        ...(input.description && { description: input.description }),
        ...(input.entryType && { entryType: input.entryType }),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, input.id))
      .returning();

    // If lines are provided, replace them
    let newLines: JournalEntryLine[] = existing.lines;
    if (input.lines) {
      await context.db.delete(journalEntryLines).where(eq(journalEntryLines.journalEntryId, input.id));

      newLines = await context.db
        .insert(journalEntryLines)
        .values(
          input.lines.map((line, index) => ({
            journalEntryId: input.id,
            accountNumber: line.accountNumber,
            accountName: line.accountName,
            debit: line.debit ? String(line.debit) : null,
            credit: line.credit ? String(line.credit) : null,
            description: line.description || null,
            vatCode: line.vatCode || null,
            sortOrder: index,
          }))
        )
        .returning();
    }

    await logAudit({
      workspaceId: context.workspaceId,
      action: "update",
      entityType: "journal_entry",
      entityId: input.id,
      changes: { before: existing, after: { ...updated, lines: newLines } },
    });

    return { ...updated, lines: newLines };
  });

export const deleteJournalEntry = authenticatedProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ context, input }) => {
    const existing = await context.db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, input.id),
        eq(journalEntries.workspaceId, context.workspaceId)
      ),
      with: {
        fiscalPeriod: true,
      },
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Journal entry not found" });
    }

    if (existing.isLocked) {
      throw new ORPCError("BAD_REQUEST", { message: "Journal entry is locked" });
    }

    if (existing.fiscalPeriod?.isLocked) {
      throw new ORPCError("BAD_REQUEST", { message: "Fiscal period is locked" });
    }

    await context.db.delete(journalEntries).where(eq(journalEntries.id, input.id));

    await logAudit({
      workspaceId: context.workspaceId,
      action: "delete",
      entityType: "journal_entry",
      entityId: input.id,
      changes: { deleted: existing },
    });

    return { success: true };
  });
