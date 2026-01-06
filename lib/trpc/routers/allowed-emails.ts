import { router, workspaceProcedure } from "../init";
import { workspaceAllowedEmails } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const allowedEmailsRouter = router({
  // List allowed emails for the current user in a workspace
  list: workspaceProcedure.query(async ({ ctx }) => {
    const emails = await ctx.db.query.workspaceAllowedEmails.findMany({
      where: and(
        eq(workspaceAllowedEmails.workspaceId, ctx.workspaceId),
        eq(workspaceAllowedEmails.userId, ctx.session.user.id)
      ),
      orderBy: (emails, { asc }) => [asc(emails.createdAt)],
    });

    return emails;
  }),

  // Add a new allowed email
  create: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        email: z
          .string()
          .email("Ogiltig e-postadress")
          .transform((e) => e.toLowerCase().trim()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists for this user in this workspace
      const existing = await ctx.db.query.workspaceAllowedEmails.findFirst({
        where: and(
          eq(workspaceAllowedEmails.workspaceId, ctx.workspaceId),
          eq(workspaceAllowedEmails.userId, ctx.session.user.id),
          eq(workspaceAllowedEmails.email, input.email)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Denna e-postadress är redan tillagd",
        });
      }

      const [allowedEmail] = await ctx.db
        .insert(workspaceAllowedEmails)
        .values({
          workspaceId: ctx.workspaceId,
          userId: ctx.session.user.id,
          email: input.email,
        })
        .returning();

      return allowedEmail;
    }),

  // Delete an allowed email
  delete: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.db.query.workspaceAllowedEmails.findFirst({
        where: and(
          eq(workspaceAllowedEmails.id, input.id),
          eq(workspaceAllowedEmails.workspaceId, ctx.workspaceId),
          eq(workspaceAllowedEmails.userId, ctx.session.user.id)
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "E-postadressen hittades inte",
        });
      }

      await ctx.db
        .delete(workspaceAllowedEmails)
        .where(eq(workspaceAllowedEmails.id, input.id));

      return { success: true };
    }),
});
