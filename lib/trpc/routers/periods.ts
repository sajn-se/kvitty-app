import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, workspaceProcedure } from "../init";
import { fiscalPeriods, annualClosings, journalEntries, journalEntryLines } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createPeriodSchema, updatePeriodSchema } from "@/lib/validations/period";

export const periodsRouter = router({
  list: workspaceProcedure.query(async ({ ctx }) => {
    const periods = await ctx.db.query.fiscalPeriods.findMany({
      where: eq(fiscalPeriods.workspaceId, ctx.workspaceId),
      orderBy: (periods, { desc }) => [desc(periods.startDate)],
    });

    return periods;
  }),

  get: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), periodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.periodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return period;
    }),

  create: workspaceProcedure
    .input(createPeriodSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check for duplicate slug
      const existing = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.workspaceId, ctx.workspaceId),
          eq(fiscalPeriods.urlSlug, input.urlSlug)
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "En period med denna URL finns redan",
        });
      }

      // Use transaction to ensure atomicity
      return await ctx.db.transaction(async (tx) => {
        const [period] = await tx
          .insert(fiscalPeriods)
          .values({
            workspaceId: ctx.workspaceId,
            label: input.label,
            urlSlug: input.urlSlug,
            startDate: input.startDate,
            endDate: input.endDate,
            fiscalYearType: input.fiscalYearType,
          })
          .returning();

        // Create opening balance journal entry if provided
        if (input.openingBalances && input.openingBalances.length > 0) {
          const validLines = input.openingBalances.filter(
            (line) => line.accountNumber > 0 && (line.debit || line.credit)
          );

          if (validLines.length > 0) {
            const [entry] = await tx
              .insert(journalEntries)
              .values({
                workspaceId: ctx.workspaceId,
                fiscalPeriodId: period.id,
                verificationNumber: 0,
                entryDate: input.startDate,
                description: "Ingående balans",
                entryType: "opening_balance",
                sourceType: "opening_balance",
                createdBy: ctx.session.user.id,
              })
              .returning();

            await tx.insert(journalEntryLines).values(
              validLines.map((line, index) => ({
                journalEntryId: entry.id,
                accountNumber: line.accountNumber,
                accountName: line.accountName,
                debit: line.debit?.toString() ?? null,
                credit: line.credit?.toString() ?? null,
                sortOrder: index,
              }))
            );
          }
        }

        return period;
      });
    }),

  update: workspaceProcedure
    .input(
      updatePeriodSchema.extend({
        workspaceId: z.string(),
        periodId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if period exists and is not locked
      const existing = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.periodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      if (existing.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte ändra en låst period",
        });
      }

      const [updated] = await ctx.db
        .update(fiscalPeriods)
        .set({
          label: input.label,
          urlSlug: input.urlSlug,
          startDate: input.startDate,
          endDate: input.endDate,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(fiscalPeriods.id, input.periodId),
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            eq(fiscalPeriods.isLocked, false)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Perioden låstes, vänligen uppdatera",
        });
      }

      return updated;
    }),

  delete: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), periodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if period exists and is not locked
      const existing = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.periodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Period hittades inte" });
      }

      if (existing.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kan inte radera en låst period",
        });
      }

      await ctx.db
        .delete(fiscalPeriods)
        .where(
          and(
            eq(fiscalPeriods.id, input.periodId),
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            eq(fiscalPeriods.isLocked, false)
          )
        );

      return { success: true };
    }),

  lock: workspaceProcedure
    .input(z.object({ periodId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.periodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (period.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Räkenskapsåret är redan låst",
        });
      }

      // Use conditional update with workspace filter for defense-in-depth
      const [updated] = await ctx.db
        .update(fiscalPeriods)
        .set({
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(fiscalPeriods.id, input.periodId),
            eq(fiscalPeriods.workspaceId, ctx.workspaceId),
            eq(fiscalPeriods.isLocked, false)
          )
        )
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Perioden låstes av någon annan, vänligen uppdatera",
        });
      }

      return updated;
    }),

  unlock: workspaceProcedure
    .input(
      z.object({
        periodId: z.string(),
        acknowledgeFinalized: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.periodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!period.isLocked) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Räkenskapsåret är inte låst",
        });
      }

      // Check for finalized bokslut
      const bokslut = await ctx.db.query.annualClosings.findFirst({
        where: and(
          eq(annualClosings.fiscalPeriodId, input.periodId),
          eq(annualClosings.workspaceId, ctx.workspaceId),
          eq(annualClosings.status, "finalized")
        ),
      });

      if (bokslut && !input.acknowledgeFinalized) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Denna period har ett färdigställt bokslut. Att låsa upp kan bryta mot bokföringslagen. Bekräfta att du förstår konsekvenserna.",
        });
      }

      // Use transaction for atomicity - both updates must succeed or fail together
      return await ctx.db.transaction(async (tx) => {
        // If bokslut exists and acknowledged, reset its status
        if (bokslut) {
          await tx
            .update(annualClosings)
            .set({
              status: "tax_calculated",
              finalizedAt: null,
              finalizedBy: null,
            })
            .where(eq(annualClosings.id, bokslut.id));
        }

        const [updated] = await tx
          .update(fiscalPeriods)
          .set({
            isLocked: false,
            lockedAt: null,
            lockedBy: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(fiscalPeriods.id, input.periodId),
              eq(fiscalPeriods.workspaceId, ctx.workspaceId)
            )
          )
          .returning();

        return updated;
      });
    }),
});
