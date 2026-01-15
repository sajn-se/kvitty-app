import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export type AuditAction = "create" | "update" | "delete";
export type AuditEntityType = "journal_entry" | "bank_transaction" | "bank_account";

interface AuditLogParams {
  workspaceId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  changes: Record<string, unknown>;
}

export function logAudit(params: AuditLogParams): Promise<void> {
  return db
    .insert(auditLogs)
    .values({
      workspaceId: params.workspaceId,
      userId: null, // API key, not a user
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: { ...params.changes, source: "api" },
    })
    .then(() => {});
}
