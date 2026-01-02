import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(100, "Namn får max vara 100 tecken"),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(100, "Namn får max vara 100 tecken"),
  slug: z
    .string()
    .length(4, "Slug måste vara exakt 4 tecken")
    .regex(/^[a-z0-9]+$/, "Endast små bokstäver och siffror")
    .optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
