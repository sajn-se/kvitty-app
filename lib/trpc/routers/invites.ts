import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, workspaceProcedure } from "../init";
import {
  workspaceInvites,
  workspaceMembers,
  workspaces,
  user,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { sendInviteEmail } from "@/lib/email/send-invite";

export const invitesRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    const invites = await ctx.db.query.workspaceInvites.findMany({
      where: and(
        eq(workspaceInvites.workspaceId, ctx.workspaceId),
        isNull(workspaceInvites.usedAt)
      ),
      with: {
        createdByUser: true,
      },
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      token: invite.token,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      createdBy: invite.createdByUser?.name || invite.createdByUser?.email,
    }));
  }),

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
      // Check if user with this email is already a member
      const targetUser = await ctx.db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (targetUser) {
        const isMember = await ctx.db.query.workspaceMembers.findFirst({
          where: and(
            eq(workspaceMembers.workspaceId, ctx.workspaceId),
            eq(workspaceMembers.userId, targetUser.id)
          ),
        });

        if (isMember) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Användaren är redan medlem i arbetsytan",
          });
        }
      }

      // Check for existing pending invite to same email
      const existingInvite = await ctx.db.query.workspaceInvites.findFirst({
        where: and(
          eq(workspaceInvites.workspaceId, ctx.workspaceId),
          eq(workspaceInvites.email, input.email),
          isNull(workspaceInvites.usedAt)
        ),
      });

      if (existingInvite) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "En inbjudan har redan skickats till denna e-postadress",
        });
      }

      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const [invite] = await ctx.db
        .insert(workspaceInvites)
        .values({
          workspaceId: ctx.workspaceId,
          email: input.email,
          token,
          createdBy: ctx.session.user.id,
          expiresAt,
        })
        .returning();

      // Get workspace name for email
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      // Send invite email
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

      await sendInviteEmail({
        to: input.email,
        inviterName: ctx.session.user.name || ctx.session.user.email || "En användare",
        workspaceName: workspace?.name || "Arbetsyta",
        inviteUrl,
      });

      return invite;
    }),

  revoke: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(workspaceInvites)
        .where(
          and(
            eq(workspaceInvites.id, input.inviteId),
            eq(workspaceInvites.workspaceId, ctx.workspaceId)
          )
        );

      return { success: true };
    }),

  resend: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.workspaceInvites.findFirst({
        where: and(
          eq(workspaceInvites.id, input.inviteId),
          eq(workspaceInvites.workspaceId, ctx.workspaceId),
          isNull(workspaceInvites.usedAt)
        ),
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inbjudan hittades inte",
        });
      }

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;

      await sendInviteEmail({
        to: invite.email,
        inviterName: ctx.session.user.name || ctx.session.user.email || "En användare",
        workspaceName: workspace?.name || "Arbetsyta",
        inviteUrl,
      });

      return { success: true };
    }),

  // Get invite info by token
  getByToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.workspaceInvites.findFirst({
        where: and(
          eq(workspaceInvites.token, input.token),
          isNull(workspaceInvites.usedAt)
        ),
        with: {
          workspace: true,
        },
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inbjudan hittades inte eller har redan använts",
        });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inbjudan har gått ut",
        });
      }

      return {
        workspace: {
          name: invite.workspace.name,
        },
        email: invite.email,
      };
    }),

  // Accept invite
  accept: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.workspaceInvites.findFirst({
        where: and(
          eq(workspaceInvites.token, input.token),
          isNull(workspaceInvites.usedAt)
        ),
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Inbjudan hittades inte eller har redan använts",
        });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inbjudan har gått ut",
        });
      }

      // Validate email matches
      if (
        ctx.session.user.email?.toLowerCase() !== invite.email.toLowerCase()
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Denna inbjudan är avsedd för ${invite.email}. Du är inloggad som ${ctx.session.user.email}.`,
        });
      }

      // Check if already a member
      const existingMember = await ctx.db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, invite.workspaceId),
          eq(workspaceMembers.userId, ctx.session.user.id)
        ),
      });

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Du är redan medlem i denna arbetsyta",
        });
      }

      // Add as member
      await ctx.db.insert(workspaceMembers).values({
        workspaceId: invite.workspaceId,
        userId: ctx.session.user.id,
      });

      // Mark invite as used
      await ctx.db
        .update(workspaceInvites)
        .set({
          usedAt: new Date(),
          usedBy: ctx.session.user.id,
        })
        .where(eq(workspaceInvites.id, invite.id));

      // Get workspace for redirect
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, invite.workspaceId),
      });

      return {
        success: true,
        workspaceSlug: workspace?.slug,
      };
    }),
});
