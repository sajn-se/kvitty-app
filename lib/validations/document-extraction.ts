import { z } from "zod";

export const getForAttachmentSchema = z.object({
  workspaceId: z.string(),
  inboxAttachmentId: z.string(),
});

export const getSuggestionsForTransactionSchema = z.object({
  workspaceId: z.string(),
  bankTransactionId: z.string(),
});

export const confirmMatchSchema = z.object({
  workspaceId: z.string(),
  suggestionId: z.string(),
});

export const dismissMatchSchema = z.object({
  workspaceId: z.string(),
  suggestionId: z.string(),
});

export const runMatchingSchema = z.object({
  workspaceId: z.string(),
  bankTransactionIds: z.array(z.string()).min(1).max(500),
});
