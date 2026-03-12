import { router, workspaceProcedure } from "../init";
import {
  documentExtractions,
  documentMatchSuggestions,
  bankTransactions,
  inboxAttachmentLinks,
  workspaces,
} from "@/lib/db/schema";
import { eq, and, ne, gte, lte, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { FLAGS } from "@/lib/feature-flags/types";
import { hasFeature } from "@/lib/feature-flags/utils";
import {
  getForAttachmentSchema,
  getSuggestionsForTransactionSchema,
  confirmMatchSchema,
  dismissMatchSchema,
  runMatchingSchema,
} from "@/lib/validations/document-extraction";
import { calculateMatchScore, filterAndRankMatches } from "@/lib/utils/document-matching";

async function requireDocumentExtraction(ctx: { db: typeof import("@/lib/db").db; workspaceId: string }) {
  const workspace = await ctx.db.query.workspaces.findFirst({
    where: eq(workspaces.id, ctx.workspaceId),
    columns: { id: true, featureFlags: true },
  });

  if (!workspace || !hasFeature(workspace, FLAGS.AI_DOCUMENT_EXTRACTION)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "AI Document Extraction is not enabled for this workspace",
    });
  }
}

export const documentExtractionsRouter = router({
  getForAttachment: workspaceProcedure
    .input(getForAttachmentSchema)
    .query(async ({ ctx, input }) => {
      await requireDocumentExtraction(ctx);

      const extraction = await ctx.db.query.documentExtractions.findFirst({
        where: and(
          eq(documentExtractions.inboxAttachmentId, input.inboxAttachmentId),
          eq(documentExtractions.workspaceId, ctx.workspaceId)
        ),
        with: {
          matchSuggestions: {
            where: eq(documentMatchSuggestions.status, "pending"),
            with: {
              bankTransaction: true,
            },
            orderBy: (s, { desc }) => [desc(s.score)],
          },
        },
      });

      return extraction ?? null;
    }),

  getSuggestionsForTransaction: workspaceProcedure
    .input(getSuggestionsForTransactionSchema)
    .query(async ({ ctx, input }) => {
      await requireDocumentExtraction(ctx);

      const suggestions = await ctx.db.query.documentMatchSuggestions.findMany({
        where: and(
          eq(documentMatchSuggestions.bankTransactionId, input.bankTransactionId),
          eq(documentMatchSuggestions.workspaceId, ctx.workspaceId),
          eq(documentMatchSuggestions.status, "pending")
        ),
        with: {
          extraction: {
            with: {
              inboxAttachment: {
                with: {
                  inboxEmail: {
                    columns: { subject: true },
                  },
                },
              },
            },
          },
        },
        orderBy: (s, { desc }) => [desc(s.score)],
      });

      return suggestions;
    }),

  confirmMatch: workspaceProcedure
    .input(confirmMatchSchema)
    .mutation(async ({ ctx, input }) => {
      await requireDocumentExtraction(ctx);

      const suggestion = await ctx.db.query.documentMatchSuggestions.findFirst({
        where: and(
          eq(documentMatchSuggestions.id, input.suggestionId),
          eq(documentMatchSuggestions.workspaceId, ctx.workspaceId)
        ),
        with: {
          extraction: true,
        },
      });

      if (!suggestion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Matchforslaget hittades inte",
        });
      }

      // Update suggestion to confirmed
      await ctx.db
        .update(documentMatchSuggestions)
        .set({
          status: "confirmed",
          confirmedBy: ctx.session.user.id,
          confirmedAt: new Date(),
        })
        .where(eq(documentMatchSuggestions.id, input.suggestionId));

      // Create inbox attachment link (reuse existing linking system)
      await ctx.db.insert(inboxAttachmentLinks).values({
        inboxAttachmentId: suggestion.extraction.inboxAttachmentId,
        bankTransactionId: suggestion.bankTransactionId,
        createdBy: ctx.session.user.id,
      }).onConflictDoNothing();

      // Dismiss other pending suggestions for the same extraction
      await ctx.db
        .update(documentMatchSuggestions)
        .set({ status: "dismissed" })
        .where(
          and(
            eq(documentMatchSuggestions.documentExtractionId, suggestion.documentExtractionId),
            ne(documentMatchSuggestions.id, input.suggestionId),
            eq(documentMatchSuggestions.status, "pending")
          )
        );

      return { success: true };
    }),

  dismissMatch: workspaceProcedure
    .input(dismissMatchSchema)
    .mutation(async ({ ctx, input }) => {
      await requireDocumentExtraction(ctx);

      const suggestion = await ctx.db.query.documentMatchSuggestions.findFirst({
        where: and(
          eq(documentMatchSuggestions.id, input.suggestionId),
          eq(documentMatchSuggestions.workspaceId, ctx.workspaceId)
        ),
      });

      if (!suggestion) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Matchforslaget hittades inte",
        });
      }

      await ctx.db
        .update(documentMatchSuggestions)
        .set({ status: "dismissed" })
        .where(eq(documentMatchSuggestions.id, input.suggestionId));

      return { success: true };
    }),

  runMatchingForNewTransactions: workspaceProcedure
    .input(runMatchingSchema)
    .mutation(async ({ ctx, input }) => {
      await requireDocumentExtraction(ctx);

      const transactions = await ctx.db.query.bankTransactions.findMany({
        where: and(
          inArray(bankTransactions.id, input.bankTransactionIds),
          eq(bankTransactions.workspaceId, ctx.workspaceId)
        ),
      });

      let totalSuggestions = 0;

      for (const transaction of transactions) {
        if (!transaction.accountingDate) continue;

        const txDate = new Date(transaction.accountingDate);
        const minDate = new Date(txDate);
        minDate.setDate(minDate.getDate() - 7);
        const maxDate = new Date(txDate);
        maxDate.setDate(maxDate.getDate() + 7);

        const extractions = await ctx.db.query.documentExtractions.findMany({
          where: and(
            eq(documentExtractions.workspaceId, ctx.workspaceId),
            eq(documentExtractions.status, "completed"),
            gte(documentExtractions.date, minDate.toISOString().split("T")[0]),
            lte(documentExtractions.date, maxDate.toISOString().split("T")[0])
          ),
        });

        const scored = extractions.map((extraction) => ({
          extraction,
          score: calculateMatchScore(extraction, transaction),
        }));

        const matches = filterAndRankMatches(scored);

        for (const match of matches) {
          await ctx.db
            .insert(documentMatchSuggestions)
            .values({
              documentExtractionId: match.extraction.id,
              bankTransactionId: transaction.id,
              workspaceId: ctx.workspaceId,
              score: match.score.score.toString(),
              amountMatch: match.score.amountMatch,
              dateMatch: match.score.dateMatch,
              textMatch: match.score.textMatch,
            })
            .onConflictDoNothing();
          totalSuggestions++;
        }
      }

      return { suggestionsCreated: totalSuggestions };
    }),
});
