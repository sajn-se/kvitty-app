import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { createCuid } from "@/lib/utils/cuid";

// ============================================
// Enums
// ============================================

export const workspaceModeEnum = pgEnum("workspace_mode", [
  "simple",
  "full_bookkeeping",
]);

export const businessTypeEnum = pgEnum("business_type", [
  "aktiebolag",
  "enskild_firma",
  "handelsbolag",
  "kommanditbolag",
  "ekonomisk_forening",
  "ideell_forening",
  "stiftelse",
  "other",
]);

export const journalEntryTypeEnum = pgEnum("journal_entry_type", [
  "kvitto",
  "inkomst",
  "leverantorsfaktura",
  "lon",
  "utlagg",
  "annat",
  "opening_balance",
]);

export const payrollRunStatusEnum = pgEnum("payroll_run_status", [
  "draft",
  "calculated",
  "approved",
  "paid",
  "reported",
]);

export const fiscalYearTypeEnum = pgEnum("fiscal_year_type", [
  "calendar",
  "broken",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
]);

export const invoiceSentMethodEnum = pgEnum("invoice_sent_method", [
  "email_pdf",
  "email_link",
  "manual",
]);

export const productUnitEnum = pgEnum("product_unit", [
  "styck",
  "timmar",
  "dagar",
  "manader",
  "kilogram",
  "gram",
  "liter",
  "meter",
  "centimeter",
  "millimeter",
  "m2",
  "m3",
  "mil",
  "kilometer",
  "ha",
  "ton",
  "ord",
  "ar",
  "veckor",
  "minuter",
  "MB",
  "GB",
]);

export const productTypeEnum = pgEnum("product_type", ["V", "T"]); // V=Varor, T=Tjänster

export const invoiceLineTypeEnum = pgEnum("invoice_line_type", ["product", "text"]);

export const vatReportingFrequencyEnum = pgEnum("vat_reporting_frequency", [
  "monthly",
  "quarterly",
  "yearly",
]);

export const annualClosingStatusEnum = pgEnum("annual_closing_status", [
  "not_started",
  "reconciliation_complete",
  "package_selected",
  "closing_entries_created",
  "tax_calculated",
  "finalized",
]);

export const closingPackageEnum = pgEnum("closing_package", ["k1", "k2", "k3"]);

export const bankTransactionStatusEnum = pgEnum("bank_transaction_status", [
  "pending",
  "matched",
  "booked",
  "ignored",
]);

export const bankImportBatchStatusEnum = pgEnum("bank_import_batch_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const inboxEmailStatusEnum = pgEnum("inbox_email_status", [
  "pending",
  "processed",
  "rejected",
  "error",
]);

// Margin scheme types for used goods taxation (vinstmarginalbeskattning)
export const marginSchemeTypeEnum = pgEnum("margin_scheme_type", [
  "used_goods",       // Begagnade varor
  "artwork",          // Konstverk
  "antiques",         // Antikviteter
  "collectors_items", // Samlarföremål
]);

// ROT/RUT deduction types
export const rotRutTypeEnum = pgEnum("rot_rut_type", [
  "rot",  // Renovation, Ombyggnad, Tillbyggnad
  "rut",  // Hushållsnära tjänster
]);
import { relations } from "drizzle-orm";

// ============================================
// Better-Auth Tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
  phone: text("phone"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Usage tracking table - per-user monthly quota
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    yearMonth: text("year_month").notNull(), // Format: "2026-01"
    requestCount: integer("request_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.yearMonth)]
);

// ============================================
// Kvitty Business Tables
// ============================================

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // 4 chars, a-z0-9
  mode: workspaceModeEnum("mode").default("simple").notNull(),
  businessType: businessTypeEnum("business_type"),
  // Organization info (for AGI XML and invoicing)
  orgNumber: text("org_number"), // Organisationsnummer (e.g., "165592540321")
  orgName: text("org_name"), // Företagsnamn
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  // Payment info for invoices
  bankgiro: text("bankgiro"), // e.g., "123-4567"
  plusgiro: text("plusgiro"), // e.g., "12 34 56-7"
  iban: text("iban"), // e.g., "SE35 5000 0000 0549 1000 0003"
  bic: text("bic"), // e.g., "ESSESESS"
  swishNumber: text("swish_number"), // For Swish payments
  paymentTermsDays: integer("payment_terms_days").default(30),
  invoiceNotes: text("invoice_notes"), // Default footer text for invoices
  // Invoice advanced settings defaults
  deliveryTerms: text("delivery_terms"), // Default delivery terms (e.g., "Fritt vårt lager")
  latePaymentInterest: decimal("late_payment_interest", { precision: 5, scale: 2 }), // Default late payment interest %
  defaultPaymentMethod: text("default_payment_method"), // Default: "bankgiro" | "plusgiro" | "iban" | "swish" | "paypal" | "custom"
  // Utlägg settings
  defaultUtlaggAccount: integer("default_utlagg_account").default(2893), // 2893 for owner, 2890 for employees
  addOcrNumber: boolean("add_ocr_number").default(false), // Auto-generate OCR numbers
  vatReportingFrequency: vatReportingFrequencyEnum("vat_reporting_frequency").default("quarterly"),
  // VAT compliance
  vatNumber: text("vat_number"), // EU VAT number (SE + orgNumber + "01", e.g., "SE559012345601")
  isVatExempt: boolean("is_vat_exempt").default(false).notNull(), // Småföretagare <120k/year
  // Email inbox settings
  inboxEmailSlug: text("inbox_email_slug"), // e.g., "kvitty" → kvitty.{slug}@inbox.kvitty.se
  // Enskild firma specific fields
  ownerPersonalNumber: text("owner_personal_number"), // Encrypted personnummer for enskild firma owner
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.userId)]
);

export const workspaceInvites = pgTable("workspace_invites", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  usedBy: text("used_by").references(() => user.id),
});

// API Keys for external API access
export const apiKeys = pgTable("api_keys", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Production API Key"
  keyHash: text("key_hash").notNull(), // SHA256 hash of the key
  keyPrefix: text("key_prefix").notNull(), // First 12 chars for identification (e.g., "kv_abc123...")
  lastUsedAt: timestamp("last_used_at"),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"), // Soft delete - set when revoked
});

// Allowed sender email addresses per user per workspace
export const workspaceAllowedEmails = pgTable(
  "workspace_allowed_emails",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.userId, table.email)]
);

// Incoming emails to workspace inbox
export const inboxEmails = pgTable("inbox_emails", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fromEmail: text("from_email").notNull(),
  subject: text("subject"),
  emailBody: text("email_body"),
  receivedAt: timestamp("received_at").notNull(),
  processedAt: timestamp("processed_at"),
  status: inboxEmailStatusEnum("status").default("pending").notNull(),
  rawMessageId: text("raw_message_id"), // For idempotency
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Attachments from inbox emails
export const inboxAttachments = pgTable("inbox_attachments", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  inboxEmailId: text("inbox_email_id")
    .notNull()
    .references(() => inboxEmails.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Junction table for many-to-many linking of inbox attachments to transactions
export const inboxAttachmentLinks = pgTable(
  "inbox_attachment_links",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    inboxAttachmentId: text("inbox_attachment_id")
      .notNull()
      .references(() => inboxAttachments.id, { onDelete: "cascade" }),
    // For full_bookkeeping mode:
    journalEntryId: text("journal_entry_id")
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    // For simple mode:
    bankTransactionId: text("bank_transaction_id")
      .references(() => bankTransactions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => [
    // Prevent duplicate links: same attachment to same journal entry
    unique("inbox_attachment_journal_link").on(table.inboxAttachmentId, table.journalEntryId),
    // Prevent duplicate links: same attachment to same bank transaction
    unique("inbox_attachment_bank_link").on(table.inboxAttachmentId, table.bankTransactionId),
  ]
);

// Notifications for users (workspace-scoped)
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Content
  type: text("type").notNull(), // "comment_mention", "inbox_email", etc.
  title: text("title").notNull(),
  message: text("message"),
  link: text("link"), // Optional link to related entity

  // Read tracking (null = unread)
  readAt: timestamp("read_at"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fiscalPeriods = pgTable(
  "fiscal_periods",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // e.g., "Räkenskapsår 2025"
    urlSlug: text("url_slug").notNull(), // e.g., "2025"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    fiscalYearType: fiscalYearTypeEnum("fiscal_year_type").default("calendar").notNull(),
    isLocked: boolean("is_locked").default(false).notNull(),
    lockedAt: timestamp("locked_at"),
    lockedBy: text("locked_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.urlSlug)]
);

// Annual closings for tracking bokslut process
export const annualClosings = pgTable("annual_closings", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fiscalPeriodId: text("fiscal_period_id")
    .notNull()
    .references(() => fiscalPeriods.id, { onDelete: "cascade" }),
  status: annualClosingStatusEnum("status").default("not_started").notNull(),
  closingPackage: closingPackageEnum("closing_package"),
  // Step completion tracking
  reconciliationCompletedAt: timestamp("reconciliation_completed_at"),
  reconciliationCompletedBy: text("reconciliation_completed_by").references(() => user.id),
  packageSelectedAt: timestamp("package_selected_at"),
  closingEntriesCreatedAt: timestamp("closing_entries_created_at"),
  taxCalculatedAt: timestamp("tax_calculated_at"),
  // Financial results
  calculatedProfit: decimal("calculated_profit", { precision: 15, scale: 2 }),
  calculatedTax: decimal("calculated_tax", { precision: 15, scale: 2 }),
  taxJournalEntryId: text("tax_journal_entry_id"),
  // Finalization
  finalizedAt: timestamp("finalized_at"),
  finalizedBy: text("finalized_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.workspaceId, table.fiscalPeriodId)
]);

// NE-bilaga entries for enskild firma tax adjustments
export const nebilagaEntries = pgTable("nebilaga_entries", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fiscalPeriodId: text("fiscal_period_id")
    .notNull()
    .references(() => fiscalPeriods.id, { onDelete: "cascade" }),
  // Tax adjustments (R13-R48) - values in öre (cents) for precision
  // R13-R16: Justeringar på företagsnivå
  r13: integer("r13").default(0), // Bokförda kostnader som inte ska dras av
  r14: integer("r14").default(0), // Bokförda intäkter som inte ska tas upp
  r15: integer("r15").default(0), // Intäkter som inte bokförts men ska tas upp
  r16: integer("r16").default(0), // Kostnader som inte bokförts men ska dras av
  // R18-R20: NEA-relaterade justeringar
  r18: integer("r18").default(0), // Avgående belopp (från NEA)
  r19: integer("r19").default(0), // Tillkommande belopp (från NEA)
  r20: integer("r20").default(0), // Resultat från annan verksamhet
  // R21-R32: Individuella justeringar
  r21: integer("r21").default(0), // Kostnader för resor till/från arbetet
  r22: integer("r22").default(0), // Ökad avsättning till ersättningsfond
  r23: integer("r23").default(0), // Minskad avsättning till ersättningsfond
  r24: integer("r24").default(0), // Sjukpenning
  r25: integer("r25").default(0), // Återfört underskott vid ackord
  r26: integer("r26").default(0), // Återfört underskott - övriga
  r27: integer("r27").default(0), // Annan justerad intäkt (ökning)
  r28: integer("r28").default(0), // Annan justerad kostnad (minskning)
  r29: integer("r29").default(0), // Outnyttjat underskott från förra året
  r30: integer("r30").default(0), // Underskott som inte får kvittas
  r31: integer("r31").default(0), // Underskott som kvittas mot kapital
  r32: integer("r32").default(0), // Övrigt
  // R34, R36: Avsättningar
  r34: integer("r34").default(0), // Avdrag för årets avsättning till periodiseringsfond
  r36: integer("r36").default(0), // Avdrag för ökning av expansionsfond
  // R37-R46: Räntefördelning och övriga
  r37: integer("r37").default(0), // Positiv räntefördelning
  r38: integer("r38").default(0), // Negativ räntefördelning
  r39: integer("r39").default(0), // Avdrag för ökning av skogskonto
  r40: integer("r40").default(0), // Uttag från skogskonto
  r41: integer("r41").default(0), // Övriga skattemässiga intäkter
  r42: integer("r42").default(0), // Övriga skattemässiga avdrag
  r43: integer("r43").default(0), // Kapitalunderlag för räntefördelning (info)
  r44: integer("r44").default(0), // Sparat fördelningsbelopp (info)
  r45: integer("r45").default(0), // Kapitalunderlag för expansionsfond (info)
  r46: integer("r46").default(0), // Expansionsfond vid årets utgång (info)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.workspaceId, table.fiscalPeriodId)
]);

// Bank import batches for tracking import history
export const bankImportBatches = pgTable("bank_import_batches", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  bankAccountId: text("bank_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(), // 'csv', 'ofx', 'sie4', 'manual'
  status: bankImportBatchStatusEnum("status").default("pending").notNull(),
  totalTransactions: integer("total_transactions").default(0),
  importedTransactions: integer("imported_transactions").default(0),
  duplicateTransactions: integer("duplicate_transactions").default(0),
  errorMessage: text("error_message"),
  importedAt: timestamp("imported_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const bankTransactions = pgTable("bank_transactions", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  bankAccountId: text("bank_account_id").references(() => bankAccounts.id, { onDelete: "set null" }),
  importBatchId: text("import_batch_id").references(() => bankImportBatches.id, { onDelete: "set null" }),
  accountNumber: text("account_number"), // Konto
  accountingDate: date("accounting_date"), // Bokföringsdag
  ledgerDate: date("ledger_date"), // Reskontradag
  currencyDate: date("currency_date"), // Valutadag
  reference: text("reference"), // Referens
  amount: decimal("amount", { precision: 15, scale: 2 }), // Insättning/Uttag
  bookedBalance: decimal("booked_balance", { precision: 15, scale: 2 }), // Bokfört saldo
  status: bankTransactionStatusEnum("status").default("pending").notNull(),
  hash: text("hash"), // For duplicate detection (date + amount + reference hash)
  duplicateOfId: text("duplicate_of_id"), // Reference to original transaction if this is a duplicate
  importedAt: timestamp("imported_at"), // When transaction was imported
  mappedToJournalEntryId: text("mapped_to_journal_entry_id").references(() => journalEntries.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id), // Nullable for API access
});

export const attachments = pgTable("attachments", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  bankTransactionId: text("bank_transaction_id")
    .notNull()
    .references(() => bankTransactions.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // Vercel Blob URL
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  bankTransactionId: text("bank_transaction_id")
    .references(() => bankTransactions.id, { onDelete: "cascade" }),
  journalEntryId: text("journal_entry_id")
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mentions: jsonb("mentions").$type<string[]>(), // Array of userIds mentioned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id), // Nullable for API access
  action: text("action").notNull(), // 'create', 'update', 'delete'
  entityType: text("entity_type").notNull(), // 'verification', 'attachment', 'comment'
  entityId: text("entity_id").notNull(),
  changes: jsonb("changes"), // Store before/after values
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============================================
// Full Bookkeeping Tables
// ============================================

// Bank accounts per workspace
export const bankAccounts = pgTable(
  "bank_accounts",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    accountNumber: integer("account_number").notNull(), // BAS konto: 1630, 1930, etc.
    name: text("name").notNull(), // Custom name or default from kontoplan
    description: text("description"),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.accountNumber)]
);

// Journal entries (multi-line verifications for full bookkeeping)
export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fiscalPeriodId: text("fiscal_period_id")
    .notNull()
    .references(() => fiscalPeriods.id, { onDelete: "cascade" }),
  verificationNumber: integer("verification_number").notNull(), // V1, V2, etc. per period
  entryDate: date("entry_date").notNull(),
  description: text("description").notNull(),
  entryType: journalEntryTypeEnum("entry_type").notNull(),
  sourceType: text("source_type"), // 'manual', 'ai_assisted', 'payroll', 'bank_import'
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id), // Nullable for API access
});

// Journal entry lines (debit/credit rows)
export const journalEntryLines = pgTable("journal_entry_lines", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  journalEntryId: text("journal_entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  accountNumber: integer("account_number").notNull(), // BAS konto
  accountName: text("account_name").notNull(), // Cached account name
  debit: decimal("debit", { precision: 15, scale: 2 }),
  credit: decimal("credit", { precision: 15, scale: 2 }),
  description: text("description"), // Optional line description
  vatCode: text("vat_code"), // Moms: 25, 12, 6, 0
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Journal entry attachments (underlag)
export const journalEntryAttachments = pgTable("journal_entry_attachments", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  journalEntryId: text("journal_entry_id")
    .notNull()
    .references(() => journalEntries.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // Vercel Blob URL
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

// Employees for payroll
export const employees = pgTable(
  "employees",
  {
    id: text("id").primaryKey().$defaultFn(() => createCuid()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    personalNumber: text("personal_number").notNull(), // Personnummer (YYYYMMDDXXXX)
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    postalCode: text("postal_code"),
    city: text("city"),
    employmentStartDate: date("employment_start_date"),
    employmentEndDate: date("employment_end_date"),
    taxTable: integer("tax_table"), // Skattetabell
    taxColumn: integer("tax_column"), // Kolumn i skattetabellen
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.personalNumber)]
);

// Payroll runs (Lönekörningar)
export const payrollRuns = pgTable("payroll_runs", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // Format: YYYYMM (e.g., "202511")
  runNumber: integer("run_number").notNull(), // 1, 2, etc. for multiple runs per month
  paymentDate: date("payment_date").notNull(),
  status: payrollRunStatusEnum("status").default("draft").notNull(),
  totalGrossSalary: decimal("total_gross_salary", { precision: 15, scale: 2 }),
  totalTaxDeduction: decimal("total_tax_deduction", { precision: 15, scale: 2 }),
  totalEmployerContributions: decimal("total_employer_contributions", { precision: 15, scale: 2 }),
  totalNetSalary: decimal("total_net_salary", { precision: 15, scale: 2 }),
  journalEntryId: text("journal_entry_id")
    .references(() => journalEntries.id), // Links to generated verification
  agiXml: text("agi_xml"), // Generated AGI XML content
  agiSubmittedAt: timestamp("agi_submitted_at"),
  agiDeadline: date("agi_deadline"), // Calculated deadline (12th of month after salary period)
  agiConfirmedAt: timestamp("agi_confirmed_at"), // When user confirmed AGI was reported
  agiConfirmedBy: text("agi_confirmed_by").references(() => user.id), // User ID who confirmed
  paidAt: timestamp("paid_at"), // When salaries were actually paid
  paidBy: text("paid_by").references(() => user.id), // User who marked as paid
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

// Payroll entries (individual employee payments per run)
export const payrollEntries = pgTable("payroll_entries", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  payrollRunId: text("payroll_run_id")
    .notNull()
    .references(() => payrollRuns.id, { onDelete: "cascade" }),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  grossSalary: decimal("gross_salary", { precision: 15, scale: 2 }).notNull(),
  taxDeduction: decimal("tax_deduction", { precision: 15, scale: 2 }).notNull(),
  employerContributions: decimal("employer_contributions", { precision: 15, scale: 2 }).notNull(),
  netSalary: decimal("net_salary", { precision: 15, scale: 2 }).notNull(),
  benefitsCar: decimal("benefits_car", { precision: 15, scale: 2 }).default("0"),
  benefitsOther: decimal("benefits_other", { precision: 15, scale: 2 }).default("0"),
  otherExpenses: decimal("other_expenses", { precision: 15, scale: 2 }).default("0"),
  workplaceAddress: text("workplace_address"),
  workplaceCity: text("workplace_city"),
  specificationNumber: integer("specification_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Salary statements (Lönebesked) for employees
export const salaryStatements = pgTable("salary_statements", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  payrollEntryId: text("payroll_entry_id")
    .notNull()
    .references(() => payrollEntries.id, { onDelete: "cascade" }),
  employeeId: text("employee_id")
    .notNull()
    .references(() => employees.id),
  period: text("period").notNull(), // YYYYMM
  pdfUrl: text("pdf_url"), // Vercel Blob URL
  sentAt: timestamp("sent_at"),
  sentTo: text("sent_to"), // Email address
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Customers & Invoices
// ============================================

export const customers = pgTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  orgNumber: text("org_number"),
  email: text("email"), // Company email
  phone: text("phone"),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  // VAT/B2B fields
  vatNumber: text("vat_number"), // Buyer's EU VAT number for reverse charge
  countryCode: text("country_code").default("SE"), // ISO 3166-1 alpha-2
  // ROT/RUT fields
  personalNumber: text("personal_number"), // Personnummer (YYYYMMDD-XXXX) for ROT/RUT
  propertyDesignation: text("property_designation"), // Fastighetsbeteckning for ROT
  apartmentNumber: text("apartment_number"), // Lägenhetsnummer for RUT (bostadsrätt)
  housingAssociationOrgNumber: text("housing_assoc_org_number"), // BRF org.nr for RUT
  // Delivery preferences
  preferredDeliveryMethod: text("preferred_delivery_method"), // "email_pdf" | "email_link" | "manual" | "e_invoice"
  einvoiceAddress: text("einvoice_address"), // Peppol ID or similar for e-invoicing
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer contacts for multi-contact support
export const customerContacts = pgTable("customer_contacts", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"), // Free-text role (e.g., "Ekonomiansvarig", "VD", "Fakturaansvarig")
  email: text("email"),
  phone: text("phone"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Beskrivning
  description: text("description"), // Extended description
  defaultQuantity: decimal("default_quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("1"),
  unit: productUnitEnum("unit").notNull().default("styck"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: integer("vat_rate").notNull().default(25), // 0, 6, 12, 25
  type: productTypeEnum("type").notNull().default("T"), // V=Varor, T=Tjänster
  marginSchemeType: marginSchemeTypeEnum("margin_scheme_type"), // VMB: used_goods, artwork, etc.
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fiscalPeriodId: text("fiscal_period_id").references(() => fiscalPeriods.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  invoiceNumber: integer("invoice_number").notNull(),
  invoiceDate: text("invoice_date").notNull(), // YYYY-MM-DD
  dueDate: text("due_date").notNull(),
  reference: text("reference"),
  subtotal: decimal("subtotal", { precision: 15, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 15, scale: 2 }).notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  sentAt: timestamp("sent_at"), // When invoice was marked as sent
  sentMethod: invoiceSentMethodEnum("sent_method"), // How invoice was sent
  shareToken: text("share_token").unique(), // Token for public link access
  openedAt: timestamp("opened_at"), // When invoice link was first opened
  openedCount: integer("opened_count").default(0).notNull(), // Number of times opened
  lastOpenedAt: timestamp("last_opened_at"), // Last open timestamp
  paidDate: text("paid_date"),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }), // Actual amount paid (for overpayment tracking)
  sentJournalEntryId: text("sent_journal_entry_id").references(() => journalEntries.id), // Link to verification when sent (revenue recognition)
  journalEntryId: text("journal_entry_id").references(() => journalEntries.id), // Link to verification when paid
  // Reminder tracking
  emailSentCount: integer("email_sent_count").default(0).notNull(),
  lastReminderSentAt: timestamp("last_reminder_sent_at"),
  reminderCount: integer("reminder_count").default(0).notNull(),
  // Advanced invoice settings (overrides workspace defaults)
  deliveryTerms: text("delivery_terms"), // Override workspace deliveryTerms
  latePaymentInterest: decimal("late_payment_interest", { precision: 5, scale: 2 }), // Override workspace late interest %
  paymentTermsDays: integer("payment_terms_days"), // Override workspace paymentTermsDays
  paymentMethod: text("payment_method"), // Override: "bankgiro" | "plusgiro" | "iban" | "swish" | "paypal" | "custom"
  paymentAccount: text("payment_account"), // Account number for selected payment method
  ocrNumber: text("ocr_number"), // OCR payment reference number
  customNotes: text("custom_notes"), // Override workspace invoiceNotes
  deliveryMethod: text("delivery_method"), // Override customer preferredDeliveryMethod
  // Compliance flags
  isReverseCharge: boolean("is_reverse_charge").default(false).notNull(), // Omvänd skattskyldighet
  // ROT/RUT deduction fields
  rotRutType: rotRutTypeEnum("rot_rut_type"), // null | "rot" | "rut"
  rotRutLaborAmount: decimal("rot_rut_labor_amount", { precision: 15, scale: 2 }), // Arbetskostnad
  rotRutMaterialAmount: decimal("rot_rut_material_amount", { precision: 15, scale: 2 }), // Material/resa
  rotRutDeductionAmount: decimal("rot_rut_deduction_amount", { precision: 15, scale: 2 }), // Skattereduktion
  rotRutDeductionManualOverride: boolean("rot_rut_deduction_manual_override").default(false), // Manuellt justerat
  // E-invoice (Peppol) status
  einvoiceSentAt: timestamp("einvoice_sent_at"),
  einvoiceStatus: text("einvoice_status"), // "pending" | "sent" | "delivered" | "failed"
  einvoiceError: text("einvoice_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceLines = pgTable("invoice_lines", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  lineType: invoiceLineTypeEnum("line_type").notNull().default("product"),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unit: productUnitEnum("unit"),
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }).notNull(),
  vatRate: integer("vat_rate").notNull().default(25), // 25, 12, 6, 0
  productType: productTypeEnum("product_type"), // V=Varor, T=Tjänster (copied from product)
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  // Margin scheme (VMB) - purchase price for profit margin calculation
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
  // ROT/RUT categorization
  isLabor: boolean("is_labor").default(false), // Arbetskostnad
  isMaterial: boolean("is_material").default(false), // Material/resekostnad
});

export const invoiceOpenLogs = pgTable("invoice_open_logs", {
  id: text("id").primaryKey().$defaultFn(() => createCuid()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
});

// ============================================
// Relations
// ============================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  workspaceMembers: many(workspaceMembers),
  createdWorkspaces: many(workspaces),
  bankTransactions: many(bankTransactions),
  attachments: many(attachments),
  comments: many(comments),
  auditLogs: many(auditLogs),
  journalEntries: many(journalEntries),
  payrollRuns: many(payrollRuns),
  workspaceAllowedEmails: many(workspaceAllowedEmails),
  inboxAttachmentLinks: many(inboxAttachmentLinks),
  aiUsage: many(aiUsage),
  notifications: many(notifications),
}));

export const aiUsageRelations = relations(aiUsage, ({ one }) => ({
  user: one(user, {
    fields: [aiUsage.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [workspaces.createdBy],
    references: [user.id],
  }),
  members: many(workspaceMembers),
  invites: many(workspaceInvites),
  apiKeys: many(apiKeys),
  fiscalPeriods: many(fiscalPeriods),
  bankTransactions: many(bankTransactions),
  auditLogs: many(auditLogs),
  // Full bookkeeping relations
  bankAccounts: many(bankAccounts),
  journalEntries: many(journalEntries),
  employees: many(employees),
  payrollRuns: many(payrollRuns),
  customers: many(customers),
  products: many(products),
  invoices: many(invoices),
  // Email inbox relations
  allowedEmails: many(workspaceAllowedEmails),
  inboxEmails: many(inboxEmails),
  inboxAttachments: many(inboxAttachments),
  // Notifications
  notifications: many(notifications),
  // NE-bilaga for enskild firma
  nebilagaEntries: many(nebilagaEntries),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(user, {
      fields: [workspaceMembers.userId],
      references: [user.id],
    }),
  })
);

export const workspaceInvitesRelations = relations(
  workspaceInvites,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceInvites.workspaceId],
      references: [workspaces.id],
    }),
    createdByUser: one(user, {
      fields: [workspaceInvites.createdBy],
      references: [user.id],
    }),
    usedByUser: one(user, {
      fields: [workspaceInvites.usedBy],
      references: [user.id],
    }),
  })
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [apiKeys.workspaceId],
    references: [workspaces.id],
  }),
  createdByUser: one(user, {
    fields: [apiKeys.createdBy],
    references: [user.id],
  }),
}));

export const workspaceAllowedEmailsRelations = relations(
  workspaceAllowedEmails,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceAllowedEmails.workspaceId],
      references: [workspaces.id],
    }),
    user: one(user, {
      fields: [workspaceAllowedEmails.userId],
      references: [user.id],
    }),
  })
);

export const inboxEmailsRelations = relations(
  inboxEmails,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [inboxEmails.workspaceId],
      references: [workspaces.id],
    }),
    attachments: many(inboxAttachments),
  })
);

export const inboxAttachmentsRelations = relations(
  inboxAttachments,
  ({ one, many }) => ({
    inboxEmail: one(inboxEmails, {
      fields: [inboxAttachments.inboxEmailId],
      references: [inboxEmails.id],
    }),
    workspace: one(workspaces, {
      fields: [inboxAttachments.workspaceId],
      references: [workspaces.id],
    }),
    links: many(inboxAttachmentLinks),
  })
);

export const inboxAttachmentLinksRelations = relations(
  inboxAttachmentLinks,
  ({ one }) => ({
    inboxAttachment: one(inboxAttachments, {
      fields: [inboxAttachmentLinks.inboxAttachmentId],
      references: [inboxAttachments.id],
    }),
    journalEntry: one(journalEntries, {
      fields: [inboxAttachmentLinks.journalEntryId],
      references: [journalEntries.id],
    }),
    bankTransaction: one(bankTransactions, {
      fields: [inboxAttachmentLinks.bankTransactionId],
      references: [bankTransactions.id],
    }),
    createdByUser: one(user, {
      fields: [inboxAttachmentLinks.createdBy],
      references: [user.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
  workspace: one(workspaces, {
    fields: [notifications.workspaceId],
    references: [workspaces.id],
  }),
}));

export const fiscalPeriodsRelations = relations(
  fiscalPeriods,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [fiscalPeriods.workspaceId],
      references: [workspaces.id],
    }),
    journalEntries: many(journalEntries),
    annualClosing: one(annualClosings),
    nebilagaEntry: one(nebilagaEntries),
    lockedByUser: one(user, {
      fields: [fiscalPeriods.lockedBy],
      references: [user.id],
    }),
  })
);

export const annualClosingsRelations = relations(
  annualClosings,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [annualClosings.workspaceId],
      references: [workspaces.id],
    }),
    fiscalPeriod: one(fiscalPeriods, {
      fields: [annualClosings.fiscalPeriodId],
      references: [fiscalPeriods.id],
    }),
    reconciliationUser: one(user, {
      fields: [annualClosings.reconciliationCompletedBy],
      references: [user.id],
    }),
    finalizedByUser: one(user, {
      fields: [annualClosings.finalizedBy],
      references: [user.id],
    }),
  })
);

export const nebilagaEntriesRelations = relations(
  nebilagaEntries,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [nebilagaEntries.workspaceId],
      references: [workspaces.id],
    }),
    fiscalPeriod: one(fiscalPeriods, {
      fields: [nebilagaEntries.fiscalPeriodId],
      references: [fiscalPeriods.id],
    }),
  })
);

export const bankImportBatchesRelations = relations(
  bankImportBatches,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [bankImportBatches.workspaceId],
      references: [workspaces.id],
    }),
    bankAccount: one(bankAccounts, {
      fields: [bankImportBatches.bankAccountId],
      references: [bankAccounts.id],
    }),
    createdByUser: one(user, {
      fields: [bankImportBatches.createdBy],
      references: [user.id],
    }),
    transactions: many(bankTransactions),
  })
);

export const bankTransactionsRelations = relations(
  bankTransactions,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [bankTransactions.workspaceId],
      references: [workspaces.id],
    }),
    bankAccount: one(bankAccounts, {
      fields: [bankTransactions.bankAccountId],
      references: [bankAccounts.id],
    }),
    importBatch: one(bankImportBatches, {
      fields: [bankTransactions.importBatchId],
      references: [bankImportBatches.id],
    }),
    mappedToJournalEntry: one(journalEntries, {
      fields: [bankTransactions.mappedToJournalEntryId],
      references: [journalEntries.id],
    }),
    createdByUser: one(user, {
      fields: [bankTransactions.createdBy],
      references: [user.id],
    }),
    attachments: many(attachments),
    comments: many(comments),
    inboxAttachmentLinks: many(inboxAttachmentLinks),
  })
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  bankTransaction: one(bankTransactions, {
    fields: [attachments.bankTransactionId],
    references: [bankTransactions.id],
  }),
  createdByUser: one(user, {
    fields: [attachments.createdBy],
    references: [user.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  bankTransaction: one(bankTransactions, {
    fields: [comments.bankTransactionId],
    references: [bankTransactions.id],
  }),
  journalEntry: one(journalEntries, {
    fields: [comments.journalEntryId],
    references: [journalEntries.id],
  }),
  createdByUser: one(user, {
    fields: [comments.createdBy],
    references: [user.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [auditLogs.workspaceId],
    references: [workspaces.id],
  }),
  user: one(user, {
    fields: [auditLogs.userId],
    references: [user.id],
  }),
}));

// ============================================
// Full Bookkeeping Relations
// ============================================

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [bankAccounts.workspaceId],
    references: [workspaces.id],
  }),
  bankTransactions: many(bankTransactions),
}));

export const journalEntriesRelations = relations(
  journalEntries,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [journalEntries.workspaceId],
      references: [workspaces.id],
    }),
    fiscalPeriod: one(fiscalPeriods, {
      fields: [journalEntries.fiscalPeriodId],
      references: [fiscalPeriods.id],
    }),
    attachments: many(journalEntryAttachments),
    comments: many(comments),
    createdByUser: one(user, {
      fields: [journalEntries.createdBy],
      references: [user.id],
    }),
    lines: many(journalEntryLines),
    mappedBankTransactions: many(bankTransactions),
    inboxAttachmentLinks: many(inboxAttachmentLinks),
  })
);

export const journalEntryLinesRelations = relations(
  journalEntryLines,
  ({ one }) => ({
    journalEntry: one(journalEntries, {
      fields: [journalEntryLines.journalEntryId],
      references: [journalEntries.id],
    }),
  })
);

export const journalEntryAttachmentsRelations = relations(
  journalEntryAttachments,
  ({ one }) => ({
    journalEntry: one(journalEntries, {
      fields: [journalEntryAttachments.journalEntryId],
      references: [journalEntries.id],
    }),
    createdByUser: one(user, {
      fields: [journalEntryAttachments.createdBy],
      references: [user.id],
    }),
  })
);

export const employeesRelations = relations(employees, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [employees.workspaceId],
    references: [workspaces.id],
  }),
  payrollEntries: many(payrollEntries),
}));

export const payrollRunsRelations = relations(
  payrollRuns,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [payrollRuns.workspaceId],
      references: [workspaces.id],
    }),
    createdByUser: one(user, {
      fields: [payrollRuns.createdBy],
      references: [user.id],
    }),
    agiConfirmedByUser: one(user, {
      fields: [payrollRuns.agiConfirmedBy],
      references: [user.id],
    }),
    paidByUser: one(user, {
      fields: [payrollRuns.paidBy],
      references: [user.id],
    }),
    journalEntry: one(journalEntries, {
      fields: [payrollRuns.journalEntryId],
      references: [journalEntries.id],
    }),
    entries: many(payrollEntries),
  })
);

export const payrollEntriesRelations = relations(payrollEntries, ({ one, many }) => ({
  payrollRun: one(payrollRuns, {
    fields: [payrollEntries.payrollRunId],
    references: [payrollRuns.id],
  }),
  employee: one(employees, {
    fields: [payrollEntries.employeeId],
    references: [employees.id],
  }),
  salaryStatements: many(salaryStatements),
}));

export const salaryStatementsRelations = relations(salaryStatements, ({ one }) => ({
  payrollEntry: one(payrollEntries, {
    fields: [salaryStatements.payrollEntryId],
    references: [payrollEntries.id],
  }),
  employee: one(employees, {
    fields: [salaryStatements.employeeId],
    references: [employees.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [customers.workspaceId],
    references: [workspaces.id],
  }),
  invoices: many(invoices),
  contacts: many(customerContacts),
}));

export const customerContactsRelations = relations(customerContacts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerContacts.customerId],
    references: [customers.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [products.workspaceId],
    references: [workspaces.id],
  }),
  invoiceLines: many(invoiceLines),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [invoices.workspaceId],
    references: [workspaces.id],
  }),
  fiscalPeriod: one(fiscalPeriods, {
    fields: [invoices.fiscalPeriodId],
    references: [fiscalPeriods.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  sentJournalEntry: one(journalEntries, {
    fields: [invoices.sentJournalEntryId],
    references: [journalEntries.id],
  }),
  journalEntry: one(journalEntries, {
    fields: [invoices.journalEntryId],
    references: [journalEntries.id],
  }),
  lines: many(invoiceLines),
  openLogs: many(invoiceOpenLogs),
}));

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLines.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceLines.productId],
    references: [products.id],
  }),
}));

export const invoiceOpenLogsRelations = relations(invoiceOpenLogs, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceOpenLogs.invoiceId],
    references: [invoices.id],
  }),
}));

// ============================================
// Type Exports
// ============================================

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMode = (typeof workspaceModeEnum.enumValues)[number];
export type BusinessType = (typeof businessTypeEnum.enumValues)[number];

export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryType = (typeof journalEntryTypeEnum.enumValues)[number];

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type NewJournalEntryLine = typeof journalEntryLines.$inferInsert;

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type PayrollRun = typeof payrollRuns.$inferSelect;
export type NewPayrollRun = typeof payrollRuns.$inferInsert;
export type PayrollRunStatus = (typeof payrollRunStatusEnum.enumValues)[number];

export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type NewPayrollEntry = typeof payrollEntries.$inferInsert;

export type FiscalYearType = (typeof fiscalYearTypeEnum.enumValues)[number];

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type CustomerContact = typeof customerContacts.$inferSelect;
export type NewCustomerContact = typeof customerContacts.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductUnit = (typeof productUnitEnum.enumValues)[number];
export type ProductType = (typeof productTypeEnum.enumValues)[number];
export type MarginSchemeType = (typeof marginSchemeTypeEnum.enumValues)[number];

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number];
export type RotRutType = (typeof rotRutTypeEnum.enumValues)[number];

export type InvoiceLine = typeof invoiceLines.$inferSelect;
export type NewInvoiceLine = typeof invoiceLines.$inferInsert;
export type InvoiceLineType = (typeof invoiceLineTypeEnum.enumValues)[number];

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type NewBankTransaction = typeof bankTransactions.$inferInsert;
export type BankTransactionStatus = (typeof bankTransactionStatusEnum.enumValues)[number];

export type BankImportBatch = typeof bankImportBatches.$inferSelect;
export type NewBankImportBatch = typeof bankImportBatches.$inferInsert;
export type BankImportBatchStatus = (typeof bankImportBatchStatusEnum.enumValues)[number];

export type SalaryStatement = typeof salaryStatements.$inferSelect;
export type NewSalaryStatement = typeof salaryStatements.$inferInsert;

export type InvoiceOpenLog = typeof invoiceOpenLogs.$inferSelect;
export type NewInvoiceOpenLog = typeof invoiceOpenLogs.$inferInsert;

export type InvoiceSentMethod = (typeof invoiceSentMethodEnum.enumValues)[number];

export type AnnualClosing = typeof annualClosings.$inferSelect;
export type NewAnnualClosing = typeof annualClosings.$inferInsert;
export type AnnualClosingStatus = (typeof annualClosingStatusEnum.enumValues)[number];
export type ClosingPackage = (typeof closingPackageEnum.enumValues)[number];

export type NebilagaEntry = typeof nebilagaEntries.$inferSelect;
export type NewNebilagaEntry = typeof nebilagaEntries.$inferInsert;

export type WorkspaceAllowedEmail = typeof workspaceAllowedEmails.$inferSelect;
export type NewWorkspaceAllowedEmail = typeof workspaceAllowedEmails.$inferInsert;

export type InboxEmail = typeof inboxEmails.$inferSelect;
export type NewInboxEmail = typeof inboxEmails.$inferInsert;
export type InboxEmailStatus = (typeof inboxEmailStatusEnum.enumValues)[number];

export type InboxAttachment = typeof inboxAttachments.$inferSelect;
export type NewInboxAttachment = typeof inboxAttachments.$inferInsert;

export type InboxAttachmentLink = typeof inboxAttachmentLinks.$inferSelect;
export type NewInboxAttachmentLink = typeof inboxAttachmentLinks.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type AiUsage = typeof aiUsage.$inferSelect;
export type NewAiUsage = typeof aiUsage.$inferInsert;
