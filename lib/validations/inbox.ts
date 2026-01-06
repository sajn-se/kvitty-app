import { z } from "zod";

export const linkAttachmentSchema = z
  .object({
    attachmentId: z.string().min(1, "Bilaga krävs"),
    journalEntryId: z.string().optional(),
    bankTransactionId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.journalEntryId && !data.bankTransactionId) ||
      (!data.journalEntryId && data.bankTransactionId),
    {
      message: "Du måste välja antingen en verifikation eller en banktransaktion",
    }
  );

export type LinkAttachmentInput = z.infer<typeof linkAttachmentSchema>;

export const inboxEmailStatusValues = [
  "pending",
  "processed",
  "rejected",
  "error",
] as const;

export type InboxEmailStatusValue = (typeof inboxEmailStatusValues)[number];
