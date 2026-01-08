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
import { eq, and, desc, sql, count, ilike, gte, lte, or } from "drizzle-orm";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@/lib/validations/journal-entry";
import { previewSIEImportSchema, importSIESchema } from "@/lib/validations/sie-import";
import { deleteFromS3 } from "@/lib/utils/s3";
import {
  parseSIEFileFromBuffer,
  filterVerificationsByDateRange,
  hashVerification,
  validateVerificationBalance,
} from "@/lib/utils/sie-import";

export const journalEntriesRouter = router({
  list: workspaceProcedure
    .input(
      z.object({
        fiscalPeriodId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        dateFrom: z.string().optional(), // YYYY-MM-DD
        dateTo: z.string().optional(), // YYYY-MM-DD
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(journalEntries.workspaceId, ctx.workspaceId),
        eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId),
      ];

      // Search filter - search in description or verification number
      if (input.search && input.search.trim()) {
        const searchTerm = `%${input.search.trim()}%`;
        conditions.push(
          or(
            ilike(journalEntries.description, searchTerm),
            // Also search by verification number (V1, V2, etc.)
            sql`CAST(${journalEntries.verificationNumber} AS TEXT) ILIKE ${searchTerm}`
          )!
        );
      }

      // Date range filter
      if (input.dateFrom) {
        conditions.push(gte(journalEntries.entryDate, input.dateFrom));
      }
      if (input.dateTo) {
        conditions.push(lte(journalEntries.entryDate, input.dateTo));
      }

      const whereClause = and(...conditions);

      const [entries, totalResult] = await Promise.all([
        ctx.db.query.journalEntries.findMany({
          where: whereClause,
          with: {
            lines: {
              orderBy: (lines, { asc }) => [asc(lines.sortOrder)],
            },
            createdByUser: true,
          },
          orderBy: [desc(journalEntries.verificationNumber)],
          limit: input.limit,
          offset: input.offset,
        }),
        ctx.db.select({ count: count() }).from(journalEntries).where(whereClause),
      ]);

      return {
        items: entries,
        total: totalResult[0]?.count ?? 0,
      };
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

  getAuditLogs: workspaceProcedure
    .input(z.object({ entityId: z.string() }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.query.auditLogs.findMany({
        where: and(
          eq(auditLogs.workspaceId, ctx.workspaceId),
          eq(auditLogs.entityId, input.entityId),
          eq(auditLogs.entityType, "journal_entry")
        ),
        with: {
          user: true,
        },
        orderBy: [desc(auditLogs.timestamp)],
      });

      return logs;
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

  // Preview SIE file import
  previewSIEImport: workspaceProcedure
    .input(previewSIEImportSchema)
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer for proper encoding detection
        const buffer = Buffer.from(input.fileContent, "base64");
        const result = parseSIEFileFromBuffer(buffer);

        // Calculate balance for each verification
        const verificationsWithStatus = result.verifications.map((v) => {
          const balance = validateVerificationBalance(v);
          return {
            ...v,
            balanced: balance.balanced,
            totalDebit: balance.totalDebit,
            totalCredit: balance.totalCredit,
          };
        });

        return {
          format: result.format,
          verifications: verificationsWithStatus,
          accounts: Array.from(result.accounts.entries()).map(([id, acc]) => ({
            id,
            name: acc.name,
            type: acc.type,
          })),
          companyName: result.companyName,
          orgNumber: result.orgNumber,
          fiscalYear: result.fiscalYear,
          softwareProduct: result.softwareProduct,
          errors: result.errors,
          warnings: result.warnings,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Kunde inte läsa SIE-filen: ${error instanceof Error ? error.message : "Okänt fel"}`,
        });
      }
    }),

  // Import verifications from SIE file
  importSIE: workspaceProcedure
    .input(importSIESchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the fiscal period exists and is not locked
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

      // Filter verifications to only those within the period date range
      const verificationsInPeriod = filterVerificationsByDateRange(
        input.verifications,
        period.startDate,
        period.endDate
      );

      if (verificationsInPeriod.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Inga verifikationer finns inom perioden ${period.label} (${period.startDate} - ${period.endDate})`,
        });
      }

      // Validate that all verifications are balanced (debit = credit)
      const unbalancedVerifications = verificationsInPeriod.filter((v) => {
        const balance = validateVerificationBalance(v);
        return !balance.balanced;
      });

      if (unbalancedVerifications.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${unbalancedVerifications.length} verifikation(er) är inte balanserade (debet ≠ kredit). Korrigera dessa innan import.`,
        });
      }

      // Check for existing verifications to detect duplicates
      const existingEntries = await ctx.db.query.journalEntries.findMany({
        where: and(
          eq(journalEntries.workspaceId, ctx.workspaceId),
          eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
        ),
        with: {
          lines: true,
        },
      });

      // Create hashes of existing entries for duplicate detection
      const existingHashes = new Set(
        existingEntries.map((entry) =>
          hashVerification({
            sourceId: entry.id,
            date: entry.entryDate,
            description: entry.description,
            lines: entry.lines.map((l) => ({
              accountNumber: l.accountNumber,
              accountName: l.accountName,
              debit: parseFloat(l.debit || "0"),
              credit: parseFloat(l.credit || "0"),
            })),
          })
        )
      );

      // Filter out duplicates
      const newVerifications = verificationsInPeriod.filter(
        (v) => !existingHashes.has(hashVerification(v))
      );

      const duplicateCount = verificationsInPeriod.length - newVerifications.length;

      if (newVerifications.length === 0) {
        return {
          imported: 0,
          skipped: duplicateCount,
          message: "Alla verifikationer fanns redan i systemet",
        };
      }

      // Use transaction for atomic import
      const importedIds = await ctx.db.transaction(async (tx) => {
        // Get next verification number within transaction
        const nextNumberResult = await tx
          .select({ maxNumber: sql<number>`MAX(${journalEntries.verificationNumber})` })
          .from(journalEntries)
          .where(
            and(
              eq(journalEntries.workspaceId, ctx.workspaceId),
              eq(journalEntries.fiscalPeriodId, input.fiscalPeriodId)
            )
          );

        let nextNumber = (nextNumberResult[0]?.maxNumber || 0) + 1;
        const ids: string[] = [];

        for (const verification of newVerifications) {
          // Create the journal entry
          const [entry] = await tx
            .insert(journalEntries)
            .values({
              workspaceId: ctx.workspaceId,
              fiscalPeriodId: input.fiscalPeriodId,
              verificationNumber: nextNumber++,
              entryDate: verification.date,
              description: verification.description || "Importerad från SIE",
              entryType: "annat",
              sourceType: "sie_import",
              createdBy: ctx.session.user.id,
            })
            .returning();

          // Create the entry lines
          await tx.insert(journalEntryLines).values(
            verification.lines.map((line, index) => ({
              journalEntryId: entry.id,
              accountNumber: line.accountNumber,
              accountName: line.accountName,
              debit: line.debit > 0 ? line.debit.toString() : null,
              credit: line.credit > 0 ? line.credit.toString() : null,
              description: line.description || null,
              sortOrder: index,
            }))
          );

          ids.push(entry.id);
        }

        return ids;
      });

      // Log the import (outside transaction for better performance)
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "import",
        entityType: "journal_entry",
        entityId: importedIds[0],
        changes: {
          sourceFile: input.sourceFileName,
          importedCount: importedIds.length,
          skippedDuplicates: duplicateCount,
          importedIds,
        },
      });

      return {
        imported: importedIds.length,
        skipped: duplicateCount,
        message: `${importedIds.length} verifikationer importerade${duplicateCount > 0 ? `, ${duplicateCount} dubbletter hoppades över` : ""}`,
      };
    }),
});
