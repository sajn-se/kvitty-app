import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import {
  journalEntries,
  journalEntryLines,
  journalEntryAttachments,
  fiscalPeriods,
  auditLogs,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@/lib/validations/journal-entry";
import { deleteFromS3 } from "@/lib/utils/s3";

export const journalEntriesRouter = router({
  list: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const entries = await ctx.db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.workspaceId, ctx.workspaceId),
          eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
        ),
        with: {
          lines: {
            orderBy: (lines, { asc }) => [asc(lines.sortOrder)],
          },
          createdByUser: true,
        },
        orderBy: [desc(journalEntries.verificationNumber)],
        limit: input.limit,
        offset: input.offset,
      });

      return entries;
    }),

  get: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.id),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
        with: {
          lines: {
            orderBy: (lines, { asc }) => [asc(lines.sortOrder)],
          },
          fiscalPeriod: true,
          createdByUser: true,
        },
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return entry;
    }),

  getNextNumber: workspaceProcedure
    .input(z.object({ fiscalPeriodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ maxNumber: sql<number>`MAX(${journalEntries.verificationNumber})` })
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
          )
        );

      return (result[0]?.maxNumber || 0) + 1;
    }),

  create: workspaceProcedure
    .input(createJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the fiscal period is locked
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Räkenskapsperioden hittades inte",
        });
      }

      if (period.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Räkenskapsåret ${period.label} är låst och kan inte ändras`,
        });
      }

      // Get next verification number
      const nextNumber = await ctx.db
        .select({ maxNumber: sql<number>`MAX(${journalEntries.verificationNumber})` })
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
          )
        );

      const verificationNumber = (nextNumber[0]?.maxNumber || 0) + 1;

      // Create the journal entry
      const [entry] = await ctx.db
        .insert(journalEntries)
        .values({
          workspaceId: ctx.workspaceId,
          fiscalPeriodId: input.fiscalPeriodId,
          verificationNumber,
          entryDate: input.entryDate,
          description: input.description,
          entryType: input.entryType,
          sourceType: input.sourceType || "manual",
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Create the entry lines
      const lines = await ctx.db
        .insert(journalEntryLines)
        .values(
          input.lines.map((line, index) => ({
            journalEntryId: entry.id,
            accountNumber: line.accountNumber,
            accountName: line.accountName,
            debit: line.debit?.toString() || null,
            credit: line.credit?.toString() || null,
            description: line.description || null,
            vatCode: line.vatCode || null,
            sortOrder: index,
          }))
        )
        .returning();

      // Log the creation
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "create",
        entityType: "journal_entry",
        entityId: entry.id,
        changes: { entry, lines },
      });

      return { ...entry, lines };
    }),

  update: workspaceProcedure
    .input(updateJournalEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.id),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (entry.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Denna verifikation är låst och kan inte ändras",
        });
      }

      // Check if the fiscal period is locked
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: eq(fiscalPeriods.id, entry.fiscalPeriodId),
      });

      if (period?.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Räkenskapsåret ${period.label} är låst och kan inte ändras`,
        });
      }

      // Update the entry
      const [updated] = await ctx.db
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
      if (input.lines) {
        await ctx.db
          .delete(journalEntryLines)
          .where(eq(journalEntryLines.journalEntryId, input.id));

        await ctx.db.insert(journalEntryLines).values(
          input.lines.map((line, index) => ({
            journalEntryId: input.id,
            accountNumber: line.accountNumber,
            accountName: line.accountName,
            debit: line.debit?.toString() || null,
            credit: line.credit?.toString() || null,
            description: line.description || null,
            vatCode: line.vatCode || null,
            sortOrder: index,
          }))
        );
      }

      // Log the update
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "update",
        entityType: "journal_entry",
        entityId: input.id,
        changes: { before: entry, after: updated },
      });

      return updated;
    }),

  delete: workspaceProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.id),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (entry.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Denna verifikation är låst och kan inte raderas",
        });
      }

      // Check if the fiscal period is locked
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: eq(fiscalPeriods.id, entry.fiscalPeriodId),
      });

      if (period?.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Räkenskapsåret ${period.label} är låst och kan inte ändras`,
        });
      }

      await ctx.db.delete(journalEntries).where(eq(journalEntries.id, input.id));

      // Log the deletion
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "journal_entry",
        entityId: input.id,
        changes: { deleted: entry },
      });

      return { success: true };
    }),

  // Get account balance for a specific account
  getAccountBalance: workspaceProcedure
    .input(
      z.object({
        accountNumber: z.number(),
        fiscalPeriodId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const baseWhere = input.fiscalPeriodId
        ? and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
          )
        : eq(journalEntries.workspaceId, ctx.workspaceId);

      const result = await ctx.db
        .select({
          totalDebit: sql<string>`COALESCE(SUM(${journalEntryLines.debit}), 0)`,
          totalCredit: sql<string>`COALESCE(SUM(${journalEntryLines.credit}), 0)`,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(baseWhere, eq(journalEntryLines.accountNumber, input.accountNumber))
        );

      const totalDebit = parseFloat(result[0]?.totalDebit || "0");
      const totalCredit = parseFloat(result[0]?.totalCredit || "0");

      return {
        accountNumber: input.accountNumber,
        totalDebit,
        totalCredit,
        balance: totalDebit - totalCredit,
      };
    }),

  // List entries by account
  listByAccount: workspaceProcedure
    .input(
      z.object({
        accountNumber: z.number(),
        fiscalPeriodId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const baseWhere = input.fiscalPeriodId
        ? and(
            eq(journalEntries.workspaceId, ctx.workspaceId),
            eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
          )
        : eq(journalEntries.workspaceId, ctx.workspaceId);

      const entries = await ctx.db
        .select({
          entry: journalEntries,
          line: journalEntryLines,
        })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(baseWhere, eq(journalEntryLines.accountNumber, input.accountNumber))
        )
        .orderBy(desc(journalEntries.entryDate), desc(journalEntries.verificationNumber))
        .limit(input.limit)
        .offset(input.offset);

      const totalResult = await ctx.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(journalEntryLines)
        .innerJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(
          and(baseWhere, eq(journalEntryLines.accountNumber, input.accountNumber))
        );

      const total = Number(totalResult[0]?.count || 0);

      return {
        entries,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Add attachment to journal entry
  addAttachment: workspaceProcedure
    .input(
      z.object({
        journalEntryId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the journal entry belongs to this workspace
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.journalEntryId),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [attachment] = await ctx.db
        .insert(journalEntryAttachments)
        .values({
          journalEntryId: input.journalEntryId,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          createdBy: ctx.session.user.id,
        })
        .returning();

      return attachment;
    }),

  // Delete attachment from journal entry
  deleteAttachment: workspaceProcedure
    .input(
      z.object({
        journalEntryId: z.string(),
        attachmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the journal entry belongs to this workspace
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.journalEntryId),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Fetch the attachment to get the file URL
      const attachment = await ctx.db.query.journalEntryAttachments.findFirst({
        where: eq(journalEntryAttachments.id, input.attachmentId),
      });

      if (!attachment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete from S3
      try {
        await deleteFromS3(attachment.fileUrl);
      } catch (error) {
        console.error("Failed to delete from S3:", error);
      }

      await ctx.db
        .delete(journalEntryAttachments)
        .where(eq(journalEntryAttachments.id, input.attachmentId));

      return { success: true };
    }),
});
