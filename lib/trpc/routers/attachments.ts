import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import { attachments, bankTransactions, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteFromS3 } from "@/lib/utils/s3";

export const attachmentsRouter = router({
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

      const items = await ctx.db.query.attachments.findMany({
        where: eq(attachments.bankTransactionId, input.bankTransactionId),
        orderBy: (a, { desc }) => [desc(a.createdAt)],
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
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
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

      const [attachment] = await ctx.db
        .insert(attachments)
        .values({
          bankTransactionId: input.bankTransactionId,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "create",
        entityType: "attachment",
        entityId: attachment.id,
        changes: { after: attachment },
      });

      return attachment;
    }),

  delete: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        bankTransactionId: z.string(),
        attachmentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attachment = await ctx.db.query.attachments.findFirst({
        where: eq(attachments.id, input.attachmentId),
        with: {
          bankTransaction: true,
        },
      });

      if (!attachment || attachment.bankTransaction.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Delete from S3
      try {
        await deleteFromS3(attachment.fileUrl);
      } catch (error) {
        console.error("Failed to delete from S3:", error);
      }

      await ctx.db.delete(attachments).where(eq(attachments.id, input.attachmentId));

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "attachment",
        entityId: input.attachmentId,
        changes: { before: attachment },
      });

      return { success: true };
    }),
});
