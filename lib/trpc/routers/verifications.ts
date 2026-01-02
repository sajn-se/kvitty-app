import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";
import { router, workspaceProcedure } from "../init";
import { verifications, fiscalPeriods, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createVerificationsSchema,
  updateVerificationSchema,
} from "@/lib/validations/verification";
import { verificationModel } from "@/lib/ai";

export const verificationsRouter = router({
  list: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), periodId: z.string() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.query.verifications.findMany({
        where: and(
          eq(verifications.workspaceId, ctx.workspaceId),
          eq(verifications.fiscalPeriodId, input.periodId)
        ),
        orderBy: (v, { desc }) => [desc(v.accountingDate), desc(v.createdAt)],
        with: {
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
        },
      });

      return items;
    }),

  get: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), verificationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const verification = await ctx.db.query.verifications.findFirst({
        where: and(
          eq(verifications.id, input.verificationId),
          eq(verifications.workspaceId, ctx.workspaceId)
        ),
        with: {
          attachments: true,
          comments: {
            orderBy: (c, { desc }) => [desc(c.createdAt)],
            with: {
              createdByUser: {
                columns: { id: true, name: true, email: true },
              },
            },
          },
          createdByUser: {
            columns: { id: true, name: true, email: true },
          },
        },
      });

      if (!verification) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return verification;
    }),

  create: workspaceProcedure
    .input(createVerificationsSchema.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify period belongs to workspace
      const period = await ctx.db.query.fiscalPeriods.findFirst({
        where: and(
          eq(fiscalPeriods.id, input.fiscalPeriodId),
          eq(fiscalPeriods.workspaceId, ctx.workspaceId)
        ),
      });

      if (!period) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid period",
        });
      }

      const created = await ctx.db
        .insert(verifications)
        .values(
          input.verifications.map((v) => ({
            workspaceId: ctx.workspaceId,
            fiscalPeriodId: input.fiscalPeriodId,
            office: v.office,
            accountingDate: v.accountingDate,
            ledgerDate: v.ledgerDate,
            currencyDate: v.currencyDate,
            reference: v.reference,
            amount: v.amount?.toString(),
            bookedBalance: v.bookedBalance?.toString(),
            createdBy: ctx.session.user.id,
          }))
        )
        .returning();

      // Create audit logs
      await ctx.db.insert(auditLogs).values(
        created.map((v) => ({
          workspaceId: ctx.workspaceId,
          userId: ctx.session.user.id,
          action: "create",
          entityType: "verification",
          entityId: v.id,
          changes: { after: v },
        }))
      );

      return created;
    }),

  update: workspaceProcedure
    .input(
      updateVerificationSchema.extend({
        workspaceId: z.string(),
        verificationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.verifications.findFirst({
        where: and(
          eq(verifications.id, input.verificationId),
          eq(verifications.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(verifications)
        .set({
          office: input.office,
          accountingDate: input.accountingDate,
          ledgerDate: input.ledgerDate,
          currencyDate: input.currencyDate,
          reference: input.reference,
          amount: input.amount?.toString(),
          bookedBalance: input.bookedBalance?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(verifications.id, input.verificationId))
        .returning();

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "update",
        entityType: "verification",
        entityId: input.verificationId,
        changes: { before: existing, after: updated },
      });

      return updated;
    }),

  delete: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), verificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.verifications.findFirst({
        where: and(
          eq(verifications.id, input.verificationId),
          eq(verifications.workspaceId, ctx.workspaceId)
        ),
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db
        .delete(verifications)
        .where(eq(verifications.id, input.verificationId));

      // Create audit log
      await ctx.db.insert(auditLogs).values({
        workspaceId: ctx.workspaceId,
        userId: ctx.session.user.id,
        action: "delete",
        entityType: "verification",
        entityId: input.verificationId,
        changes: { before: existing },
      });

      return { success: true };
    }),

  analyzeContent: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        content: z.string().min(1).max(50000),
      })
    )
    .mutation(async ({ input }) => {
      const result = await generateObject({
        model: verificationModel,
        schema: z.object({
          verifications: z.array(
            z.object({
              office: z.string().nullable(),
              accountingDate: z.string().nullable(),
              reference: z.string().nullable(),
              amount: z.number().nullable(),
            })
          ),
        }),
        prompt: `Extract verification/transaction data from the following content.

For each row/transaction found, extract:
- office: Account number or office code (if present)
- accountingDate: Date in YYYY-MM-DD format (if present)
- reference: Description, memo, or reference text
- amount: Numeric amount (negative for debits/expenses, positive for credits)

Return only the extracted data, no explanations.

Content to analyze:
${input.content}`,
      });

      return result.object;
    }),
});
