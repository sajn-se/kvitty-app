import {
  pgTable,
  text,
  timestamp,
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// Better-Auth Tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  name: text("name"),
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

// ============================================
// Kvitty Business Tables
// ============================================

export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // 4 chars, a-z0-9
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by").references(() => user.id),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
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

export const fiscalPeriods = pgTable(
  "fiscal_periods",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // e.g., "2024/2025"
    urlSlug: text("url_slug").notNull(), // e.g., "2024-2025"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.workspaceId, table.urlSlug)]
);

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  fiscalPeriodId: text("fiscal_period_id")
    .notNull()
    .references(() => fiscalPeriods.id, { onDelete: "cascade" }),
  office: text("office"), // Kontor
  accountingDate: date("accounting_date"), // Bokföringsdag
  ledgerDate: date("ledger_date"), // Reskontradag
  currencyDate: date("currency_date"), // Valutadag
  reference: text("reference"), // Referens
  amount: decimal("amount", { precision: 15, scale: 2 }), // Insättning/Uttag
  bookedBalance: decimal("booked_balance", { precision: 15, scale: 2 }), // Bokfört saldo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const attachments = pgTable("attachments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  verificationId: text("verification_id")
    .notNull()
    .references(() => verifications.id, { onDelete: "cascade" }),
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
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  verificationId: text("verification_id")
    .notNull()
    .references(() => verifications.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  action: text("action").notNull(), // 'create', 'update', 'delete'
  entityType: text("entity_type").notNull(), // 'verification', 'attachment', 'comment'
  entityId: text("entity_id").notNull(),
  changes: jsonb("changes"), // Store before/after values
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ============================================
// Relations
// ============================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  workspaceMembers: many(workspaceMembers),
  createdWorkspaces: many(workspaces),
  verifications: many(verifications),
  attachments: many(attachments),
  comments: many(comments),
  auditLogs: many(auditLogs),
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
  fiscalPeriods: many(fiscalPeriods),
  verifications: many(verifications),
  auditLogs: many(auditLogs),
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

export const fiscalPeriodsRelations = relations(
  fiscalPeriods,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [fiscalPeriods.workspaceId],
      references: [workspaces.id],
    }),
    verifications: many(verifications),
  })
);

export const verificationsRelations = relations(
  verifications,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [verifications.workspaceId],
      references: [workspaces.id],
    }),
    fiscalPeriod: one(fiscalPeriods, {
      fields: [verifications.fiscalPeriodId],
      references: [fiscalPeriods.id],
    }),
    createdByUser: one(user, {
      fields: [verifications.createdBy],
      references: [user.id],
    }),
    attachments: many(attachments),
    comments: many(comments),
  })
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  verification: one(verifications, {
    fields: [attachments.verificationId],
    references: [verifications.id],
  }),
  createdByUser: one(user, {
    fields: [attachments.createdBy],
    references: [user.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  verification: one(verifications, {
    fields: [comments.verificationId],
    references: [verifications.id],
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
