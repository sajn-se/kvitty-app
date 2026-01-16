import { z } from "zod";

// Condition types for matching transactions
export const conditionTypes = [
  "contains",
  "equals",
  "starts_with",
  "ends_with",
  "regex",
  "amount_gt",
  "amount_lt",
  "amount_range",
] as const;

export type ConditionType = (typeof conditionTypes)[number];

// Action types for what to do when a rule matches
export const actionTypes = [
  "suggest_template",
  "suggest_account",
  "auto_book",
] as const;

export type ActionType = (typeof actionTypes)[number];

// Condition type labels for UI
export const conditionTypeLabels: Record<ConditionType, string> = {
  contains: "Innehåller",
  equals: "Är lika med",
  starts_with: "Börjar med",
  ends_with: "Slutar med",
  regex: "Matchar regex",
  amount_gt: "Belopp större än",
  amount_lt: "Belopp mindre än",
  amount_range: "Belopp mellan",
};

// Action type labels for UI
export const actionTypeLabels: Record<ActionType, string> = {
  suggest_template: "Föreslå mall",
  suggest_account: "Föreslå konto",
  auto_book: "Bokför automatiskt",
};

// Validation schema for creating a rule
export const createCategorizationRuleSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1, "Namn krävs").max(100, "Namn får vara max 100 tecken"),
  description: z.string().max(500).optional().nullable(),
  priority: z.number().int().min(0).optional(), // Optional - auto-assigned if not provided
  isActive: z.boolean(),
  conditionType: z.enum(conditionTypes),
  conditionValue: z.string().min(1, "Villkorsvärde krävs").max(500, "Villkorsvärde får vara max 500 tecken"),
  actionType: z.enum(actionTypes),
  actionValue: z.string().min(1, "Åtgärdsvärde krävs").max(200, "Åtgärdsvärde får vara max 200 tecken"),
});

export type CreateCategorizationRuleInput = z.output<typeof createCategorizationRuleSchema>;

// Validation schema for updating a rule
export const updateCategorizationRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Namn krävs").max(100, "Namn får vara max 100 tecken").optional(),
  description: z.string().max(500).optional().nullable(),
  priority: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  conditionType: z.enum(conditionTypes).optional(),
  conditionValue: z.string().min(1, "Villkorsvärde krävs").max(500, "Villkorsvärde får vara max 500 tecken").optional(),
  actionType: z.enum(actionTypes).optional(),
  actionValue: z.string().min(1, "Åtgärdsvärde krävs").max(200, "Åtgärdsvärde får vara max 200 tecken").optional(),
});

export type UpdateCategorizationRuleInput = z.infer<typeof updateCategorizationRuleSchema>;

// Schema for batch updating priorities
export const updateRulePrioritiesSchema = z.object({
  workspaceId: z.string(),
  priorities: z
    .array(
      z.object({
        id: z.string(),
        priority: z.number().int().min(0),
      })
    )
    .max(100, "Max 100 regler kan uppdateras åt gången"),
});

export type UpdateRulePrioritiesInput = z.infer<typeof updateRulePrioritiesSchema>;
