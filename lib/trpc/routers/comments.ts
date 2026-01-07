import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import { comments, bankTransactions, journalEntries, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const commentsRouter = router({
  list: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), bankTransactionId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify bank transaction belongs to workspace
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const items = await ctx.db.query.comments.findMany({
        where: eq(comments.bankTransactionId, input.bankTransactionId),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
        with: {
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
        },
      });

      return items;
    }),

  listForJournalEntry: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), journalEntryId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify journal entry belongs to workspace
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.journalEntryId),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const items = await ctx.db.query.comments.findMany({
        where: eq(comments.journalEntryId, input.journalEntryId),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
        with: {
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
        },
      });

      return items;
    }),

  create: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
        content: z.string().min(1, "Kommentar krävs"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify bank transaction belongs to workspace
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: and(
          eq(bankTransactions.id, input.bankTransactionId),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [comment] = await ctx.db
        .insert(comments)
        .values({
          bankTransactionId: input.bankTransactionId,
          content: input.content,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "create",
        entityType: "comment",
        entityId: comment.id,
        changes: { after: comment },
      });

      return comment;
    }),

  createForJournalEntry: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        journalEntryId: z.string(),
        content: z.string().min(1, "Kommentar krävs"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify journal entry belongs to workspace
      const entry = await ctx.db.query.journalEntries.findFirst({
        where: and(
          eq(journalEntries.id, input.journalEntryId),
          eq(journalEntries.workspaceId, ctx.workspaceId)
        ),
      });

      if (!entry) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [comment] = await ctx.db
        .insert(comments)
        .values({
          journalEntryId: input.journalEntryId,
          content: input.content,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "create",
        entityType: "comment",
        entityId: comment.id,
        changes: { after: comment },
      });

      return comment;
    }),

  delete: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
        with: {
          bankTransaction: true,
        },
      });

      if (!comment || comment.bankTransaction?.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Only comment creator can delete
      if (comment.createdBy !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "comment",
        entityId: input.commentId,
        changes: { before: comment },
      });

      return { success: true };
    }),

  deleteForJournalEntry: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        journalEntryId: z.string(),
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.query.comments.findFirst({
        where: eq(comments.id, input.commentId),
        with: {
          journalEntry: true,
        },
      });

      if (!comment || comment.journalEntry?.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Only comment creator can delete
      if (comment.createdBy !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db.delete(comments).where(eq(comments.id, input.commentId));

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "comment",
        entityId: input.commentId,
        changes: { before: comment },
      });

      return { success: true };
    }),
});
