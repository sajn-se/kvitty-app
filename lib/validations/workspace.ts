import { z } from "zod";

// Workspace mode enum values
export const workspaceModes = ["simple", "full_bookkeeping"] as const;
export type WorkspaceMode = (typeof workspaceModes)[number];

// Business type enum values
export const businessTypes = [
  "aktiebolag",
  "enskild_firma",
  "handelsbolag",
  "kommanditbolag",
  "ekonomisk_forening",
  "ideell_forening",
  "stiftelse",
  "other",
] as const;
export type BusinessType = (typeof businessTypes)[number];

// Swedish organization number validation (10 or 12 digits)
const orgNumberSchema = z
  .union([
    z.literal(""),
    z
      .string()
      .transform((val) => val.replace(/\D/g, ""))
      .pipe(
        z
          .string()
          .regex(/^\d{10,12}$/, "Organisationsnummer måste vara 10-12 siffror")
      ),
  ])
  .optional();

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(100, "Namn får max vara 100 tecken"),
  mode: z.enum(workspaceModes).default("simple"),
  businessType: z.enum(businessTypes).optional(),
  // Organization info
  orgNumber: orgNumberSchema,
  orgName: z.string().max(200, "Företagsnamn får max vara 200 tecken").optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email("Ogiltig e-postadress").optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  postalCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Namn krävs").max(100, "Namn får max vara 100 tecken"),
  slug: z
    .string()
    .length(4, "Slug måste vara exakt 4 tecken")
    .regex(/^[a-z0-9]+$/, "Endast små bokstäver och siffror")
    .optional(),
  mode: z.enum(workspaceModes).optional(),
  businessType: z.enum(businessTypes).optional().nullable(),
  // Organization info
  orgNumber: orgNumberSchema,
  orgName: z.string().max(200, "Företagsnamn får max vara 200 tecken").optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  contactEmail: z.string().email("Ogiltig e-postadress").optional().nullable().or(z.literal("")),
  address: z.string().max(200).optional().nullable(),
  postalCode: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  // Payment info
  bankgiro: z.string().max(20).optional().nullable(),
  plusgiro: z.string().max(20).optional().nullable(),
  iban: z.string().max(34).optional().nullable(),
  bic: z.string().max(11).optional().nullable(),
  swishNumber: z.string().max(20).optional().nullable(),
  paymentTermsDays: z.number().min(1).max(365).optional().nullable(),
  invoiceNotes: z.string().max(1000).optional().nullable(),
  // Invoice defaults
  deliveryTerms: z.string().max(200).optional().nullable(),
  latePaymentInterest: z.number().min(0).max(100).optional().nullable(),
  defaultPaymentMethod: z.string().max(50).optional().nullable(),
  addOcrNumber: z.boolean().optional().nullable(),
  // Utlägg settings (UI restricts to 2890 or 2893)
  defaultUtlaggAccount: z.number().int().optional().nullable(),
  vatReportingFrequency: z.enum(["monthly", "quarterly", "yearly"]).optional().nullable(),
  // VAT compliance
  vatNumber: z
    .string()
    .max(20)
    .regex(/^SE\d{12}$/, "VAT-nummer måste vara i format SE + 12 siffror (t.ex. SE559012345601)")
    .optional()
    .nullable()
    .or(z.literal("")),
  isVatExempt: z.boolean().optional().nullable(),
  // Email inbox settings
  inboxEmailSlug: z
    .string()
    .min(1, "Inkorgs-slug krävs")
    .max(50, "Inkorgs-slug får max vara 50 tecken")
    .regex(
      /^[a-z0-9]+(\.[a-z0-9]+)?$/,
      "Endast små bokstäver, siffror och en punkt tillåts (t.ex. 'företag.ab12')"
    )
    .optional()
    .nullable(),
  // Enskild firma specific fields
  ownerPersonalNumber: z
    .string()
    .regex(/^\d{12}$/, "Personnummer måste vara 12 siffror (ÅÅÅÅMMDDXXXX)")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
