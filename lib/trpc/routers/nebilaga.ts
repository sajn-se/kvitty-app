import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import { nebilagaEntries, workspaces, fiscalPeriods } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  saveNebilagaAdjustmentsSchema,
  getNebilagaSchema,
  getFieldMappingSchema,
} from "@/lib/validations/nebilaga";
import {
  calculateNebilagaData,
  getFieldMappingDetails,
} from "@/lib/utils/nebilaga-calculator";
import { encrypt } from "@/lib/utils/encryption";
import { createCuid } from "@/lib/utils/cuid";

export const nebilagaRouter = router({
  /**
   * Get NE-bilaga data for a fiscal period
   * Returns calculated values from bookkeeping + saved tax adjustments
   */
  get: workspaceProcedure
    .input(getNebilagaSchema)
    .query(async ({ ctx, input }) => {
      // Verify workspace is enskild_firma
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace hittades inte",
        });
      }

      if (workspace.businessType !== "enskild_firma") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "NE-bilaga är endast tillgänglig för enskild firma",
        });
      }

      // Verify fiscal period exists and belongs to workspace
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Räkenskapsåret hittades inte",
        });
      }

      // Calculate and return NE-bilaga data
      return calculateNebilagaData(ctx.workspaceId, input.fiscalPeriodId);
    }),

  /**
   * Save NE-bilaga tax adjustments (R13-R48 manual fields)
   */
  save: workspaceProcedure
    .input(saveNebilagaAdjustmentsSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify workspace is enskild_firma
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace hittades inte",
        });
      }

      if (workspace.businessType !== "enskild_firma") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "NE-bilaga är endast tillgänglig för enskild firma",
        });
      }

      // Verify fiscal period exists and belongs to workspace
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Räkenskapsåret hittades inte",
        });
      }

      // Check if entry already exists
      const existing = await ctx.db.query.nebilagaEntries.findFirst({
        where: and(
          eq(nebilagaEntries.workspaceId, ctx.workspaceId),
          eq(nebilagaEntries.fiscalPeriodId, input.fiscalPeriodId)
        ),
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fiscalPeriodId, workspaceId: _workspaceId, ...adjustments } = input;

      if (existing) {
        // Update existing entry
        await ctx.db
          .update(nebilagaEntries)
          .set({
            ...adjustments,
            updatedAt: new Date(),
          })
          .where(eq(nebilagaEntries.id, existing.id));

        return { id: existing.id, updated: true };
      } else {
        // Create new entry
        const id = createCuid();
        await ctx.db.insert(nebilagaEntries).values({
          id,
          workspaceId: ctx.workspaceId,
          fiscalPeriodId,
          ...adjustments,
        });

        return { id, updated: false };
      }
    }),

  /**
   * Get field mapping details (which accounts/verifications contributed)
   */
  getFieldMapping: workspaceProcedure
    .input(getFieldMappingSchema)
    .query(async ({ ctx, input }) => {
      // Verify fiscal period exists and belongs to workspace
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Räkenskapsåret hittades inte",
        });
      }

      return getFieldMappingDetails(
        ctx.workspaceId,
        input.fiscalPeriodId,
        input.field
      );
    }),

  /**
   * Check if NE-bilaga is available for a workspace
   */
  isAvailable: workspaceProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.db.query.workspaces.findFirst({
      where: eq(workspaces.id, ctx.workspaceId),
    });

    return {
      available: workspace?.businessType === "enskild_firma",
      businessType: workspace?.businessType ?? null,
      hasOwnerPersonalNumber: !!workspace?.ownerPersonalNumber,
    };
  }),

  /**
   * Update owner personal number (encrypted)
   */
  updateOwnerPersonalNumber: workspaceProcedure
    .input(
      z.object({
        personalNumber: z
          .string()
          .regex(/^\d{12}$/, "Personnummer måste vara 12 siffror")
          .or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify workspace is enskild_firma
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, ctx.workspaceId),
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace hittades inte",
        });
      }

      if (workspace.businessType !== "enskild_firma") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Personnummer för ägare är endast tillgängligt för enskild firma",
        });
      }

      // Encrypt and save
      const encryptedValue = input.personalNumber
        ? encrypt(input.personalNumber)
        : null;

      await ctx.db
        .update(workspaces)
        .set({
          ownerPersonalNumber: encryptedValue,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, ctx.workspaceId));

      return { success: true };
    }),
});
