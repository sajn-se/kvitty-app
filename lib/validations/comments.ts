import { z } from "zod";

export const createCommentSchema = z.object({
  workspaceId: z.string(),
  bankTransactionId: z.string().optional(),
  journalEntryId: z.string().optional(),
  content: z.string().min(1, "Kommentar krävs"),
  mentions: z.array(z.string()).optional(),
});

export const createCommentForBankTransactionSchema = createCommentSchema
  .extend({
    bankTransactionId: z.string(),
  })
  .omit({ journalEntryId: true });

export const createCommentForJournalEntrySchema = createCommentSchema
  .extend({
    journalEntryId: z.string(),
  })
  .omit({ bankTransactionId: true });

export const deleteCommentSchema = z.object({
  workspaceId: z.string(),
  bankTransactionId: z.string().optional(),
  journalEntryId: z.string().optional(),
  commentId: z.string(),
});
