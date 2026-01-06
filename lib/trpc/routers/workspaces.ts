import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, workspaceProcedure } from "../init";
import { workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { generateUniqueSlug } from "@/lib/workspace-slug";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "@/lib/validations/workspace";

export const workspacesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, ctx.session.user.id),
      with: {
        workspace: true,
      },
    });

    return memberships.map((m) => m.workspace);
  }),

  get: workspaceProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.query.workspaces.findFirst({
      where: eq(workspaces.id, ctx.workspaceId),
    });

    if (!workspace) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return workspace;
  }),

  create: protectedProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = await generateUniqueSlug();

      const [workspace] = await ctx.db
        .insert(workspaces)
        .values({
          name: input.name,
          slug,
          mode: input.mode,
          businessType: input.businessType,
          orgNumber: input.orgNumber || null,
          orgName: input.orgName || null,
          contactName: input.contactName || null,
          contactPhone: input.contactPhone || null,
          contactEmail: input.contactEmail || null,
          address: input.address || null,
          postalCode: input.postalCode || null,
          city: input.city || null,
          createdBy: ctx.session.user.id,
        })
        .returning();

      // Add creator as member
      await ctx.db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: ctx.session.user.id,
      });

      return workspace;
    }),

  update: workspaceProcedure
    .input(updateWorkspaceSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // If slug is being updated, check for uniqueness
      if (input.slug) {
        const existing = await ctx.db.query.workspaces.findFirst({
          where: and(
            eq(workspaces.slug, input.slug),
            ne(workspaces.id, ctx.workspaceId)
          ),
        });

        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Denna URL-slug finns redan",
          });
        }
      }

      // If inboxEmailSlug is being updated, check for uniqueness
      if (input.inboxEmailSlug) {
        const existingInbox = await ctx.db.query.workspaces.findFirst({
          where: and(
            eq(workspaces.inboxEmailSlug, input.inboxEmailSlug),
            ne(workspaces.id, ctx.workspaceId)
          ),
        });

        if (existingInbox) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Denna e-postadress används redan av en annan arbetsyta",
          });
        }
      }

      const [updated] = await ctx.db
        .update(workspaces)
        .set({
          name: input.name,
          ...(input.slug && { slug: input.slug }),
          ...(input.mode && { mode: input.mode }),
          ...(input.businessType !== undefined && { businessType: input.businessType }),
          ...(input.orgNumber !== undefined && { orgNumber: input.orgNumber || null }),
          ...(input.orgName !== undefined && { orgName: input.orgName || null }),
          ...(input.contactName !== undefined && { contactName: input.contactName || null }),
          ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone || null }),
          ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail || null }),
          ...(input.address !== undefined && { address: input.address || null }),
          ...(input.postalCode !== undefined && { postalCode: input.postalCode || null }),
          ...(input.city !== undefined && { city: input.city || null }),
          // Payment info
          ...(input.bankgiro !== undefined && { bankgiro: input.bankgiro || null }),
          ...(input.plusgiro !== undefined && { plusgiro: input.plusgiro || null }),
          ...(input.iban !== undefined && { iban: input.iban || null }),
          ...(input.bic !== undefined && { bic: input.bic || null }),
          ...(input.swishNumber !== undefined && { swishNumber: input.swishNumber || null }),
          ...(input.paymentTermsDays !== undefined && { paymentTermsDays: input.paymentTermsDays }),
          ...(input.invoiceNotes !== undefined && { invoiceNotes: input.invoiceNotes || null }),
          // Invoice defaults
          ...(input.deliveryTerms !== undefined && { deliveryTerms: input.deliveryTerms || null }),
          ...(input.latePaymentInterest !== undefined && {
            latePaymentInterest: input.latePaymentInterest?.toString() ?? null,
          }),
          ...(input.defaultPaymentMethod !== undefined && { defaultPaymentMethod: input.defaultPaymentMethod || null }),
          ...(input.addOcrNumber !== undefined && { addOcrNumber: input.addOcrNumber }),
          // Email inbox settings
          ...(input.inboxEmailSlug !== undefined && { inboxEmailSlug: input.inboxEmailSlug || null }),
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, ctx.workspaceId))
        .returning();

      return updated;
    }),

  delete: workspaceProcedure.mutation(async ({ ctx }) => {
    const workspace = await ctx.db.query.workspaces.findFirst({
      where: eq(workspaces.id, ctx.workspaceId),
    });

    if (!workspace) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Only creator can delete
    if (workspace.createdBy !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    await ctx.db.delete(workspaces).where(eq(workspaces.id, ctx.workspaceId));

    return { success: true };
  }),
});
