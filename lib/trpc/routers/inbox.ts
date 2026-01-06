import { router, workspaceProcedure } from "../init";
import {
  inboxEmails,
  inboxAttachments,
  inboxAttachmentLinks,
  journalEntries,
  bankTransactions,
} from "@/lib/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const inboxRouter = router({
  // List inbox emails with attachments
  list: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        status: z
          .enum(["pending", "processed", "rejected", "error", "all"])
          .optional()
          .default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const emails = await ctx.db.query.inboxEmails.findMany({
        where: and(
          eq(inboxEmails.workspaceId, ctx.workspaceId),
          input.status !== "all"
            ? eq(inboxEmails.status, input.status)
            : undefined
        ),
        with: {
          attachments: {
            with: {
              links: true,
            },
          },
        },
        orderBy: [desc(inboxEmails.receivedAt)],
        limit: input.limit,
        offset: input.offset,
      });

      return emails;
    }),

  // Get unlinked attachments for the linking UI
  getUnlinkedAttachments: workspaceProcedure.query(async ({ ctx }) => {
    const attachments = await ctx.db.query.inboxAttachments.findMany({
      where: eq(inboxAttachments.workspaceId, ctx.workspaceId),
      with: {
        links: true,
        inboxEmail: true,
      },
      orderBy: [desc(inboxAttachments.createdAt)],
    });

    // Filter to only unlinked attachments
    return attachments.filter((a) => a.links.length === 0);
  }),

  // Link an attachment to a journal entry or bank transaction
  linkAttachment: workspaceProcedure
    .input(
      z
        .object({
          workspaceId: z.string(),
          attachmentId: z.string(),
          journalEntryId: z.string().optional(),
          bankTransactionId: z.string().optional(),
        })
        .refine(
          (data) =>
            (data.journalEntryId && !data.bankTransactionId) ||
            (!data.journalEntryId && data.bankTransactionId),
          {
            message:
              "Du måste välja antingen en verifikation eller en banktransaktion",
          }
        )
    )
    .mutation(async ({ ctx, input }) => {
      // Verify attachment exists and belongs to workspace
      const attachment = await ctx.db.query.inboxAttachments.findFirst({
        where: and(
          eq(inboxAttachments.id, input.attachmentId),
          eq(inboxAttachments.workspaceId, ctx.workspaceId)
        ),
      });

      if (!attachment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bilagan hittades inte",
        });
      }

      // Verify journalEntryId belongs to the workspace (SECURITY: prevent cross-workspace linking)
      if (input.journalEntryId) {
        const entry = await ctx.db.query.journalEntries.findFirst({
          where: and(
            eq(journalEntries.id, input.journalEntryId),
            eq(journalEntries.workspaceId, ctx.workspaceId)
          ),
        });
        if (!entry) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Verifikationen hittades inte",
          });
        }
      }

      // Verify bankTransactionId belongs to the workspace (SECURITY: prevent cross-workspace linking)
      if (input.bankTransactionId) {
        const transaction = await ctx.db.query.bankTransactions.findFirst({
          where: and(
            eq(bankTransactions.id, input.bankTransactionId),
            eq(bankTransactions.workspaceId, ctx.workspaceId)
          ),
        });
        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banktransaktionen hittades inte",
          });
        }
      }

      // Check if this exact link already exists
      const existingLink = await ctx.db.query.inboxAttachmentLinks.findFirst({
        where: and(
          eq(inboxAttachmentLinks.inboxAttachmentId, input.attachmentId),
          input.journalEntryId
            ? eq(inboxAttachmentLinks.journalEntryId, input.journalEntryId)
            : isNull(inboxAttachmentLinks.journalEntryId),
          input.bankTransactionId
            ? eq(
                inboxAttachmentLinks.bankTransactionId,
                input.bankTransactionId
              )
            : isNull(inboxAttachmentLinks.bankTransactionId)
        ),
      });

      if (existingLink) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Denna koppling finns redan",
        });
      }

      const [link] = await ctx.db
        .insert(inboxAttachmentLinks)
        .values({
          inboxAttachmentId: input.attachmentId,
          journalEntryId: input.journalEntryId || null,
          bankTransactionId: input.bankTransactionId || null,
          createdBy: ctx.session.user.id,
        })
        .returning();

      return link;
    }),

  // Unlink an attachment
  unlinkAttachment: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        linkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the link exists and the attachment belongs to the workspace
      const link = await ctx.db.query.inboxAttachmentLinks.findFirst({
        where: eq(inboxAttachmentLinks.id, input.linkId),
        with: {
          inboxAttachment: true,
        },
      });

      if (!link || link.inboxAttachment.workspaceId !== ctx.workspaceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kopplingen hittades inte",
        });
      }

      await ctx.db
        .delete(inboxAttachmentLinks)
        .where(eq(inboxAttachmentLinks.id, input.linkId));

      return { success: true };
    }),

  // Update email status (for processing)
  updateStatus: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        emailId: z.string(),
        status: z.enum(["pending", "processed", "rejected", "error"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = await ctx.db.query.inboxEmails.findFirst({
        where: and(
          eq(inboxEmails.id, input.emailId),
          eq(inboxEmails.workspaceId, ctx.workspaceId)
        ),
      });

      if (!email) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "E-postmeddelandet hittades inte",
        });
      }

      const [updated] = await ctx.db
        .update(inboxEmails)
        .set({
          status: input.status,
          processedAt: input.status === "processed" ? new Date() : null,
        })
        .where(eq(inboxEmails.id, input.emailId))
        .returning();

      return updated;
    }),
});
