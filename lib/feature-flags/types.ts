/**
 * Centralized feature flag registry.
 * Add new flags here - they propagate to types and runtime checks automatically.
 * Enable via Drizzle Studio: edit featureFlags column with {"flag_name": true}
 */
export const FLAGS = {
  AI_BOOKKEEPING_ASSISTANT: "ai_bookkeeping_assistant",
  AI_RECEIPT_ANALYSIS: "ai_receipt_analysis",
  AI_BANK_EXTRACTION: "ai_bank_extraction",
  AI_DOCUMENT_EXTRACTION: "ai_document_extraction",
  ADVANCED_REPORTING: "advanced_reporting",
  PEPPOL_EINVOICING: "peppol_einvoicing",
  MULTI_CURRENCY: "multi_currency",
  CUSTOM_WORKFLOWS: "custom_workflows",
  API_ACCESS: "api_access",
  INVENTORY_MANAGEMENT: "inventory_management",
} as const;

export type FeatureFlag = (typeof FLAGS)[keyof typeof FLAGS];

export const ALL_FEATURE_FLAGS = Object.values(FLAGS);

export type FeatureFlagConfig = Partial<Record<FeatureFlag, boolean>>;
