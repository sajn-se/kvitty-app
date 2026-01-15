"use client";

import { PageHeader } from "@/components/layout/page-header";
import { NotificationsTable } from "@/components/notifications/notifications-table";
import { useWorkspace } from "@/components/workspace-provider";

export default function NotificationsPage() {
  const { workspace } = useWorkspace();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        workspaceSlug={workspace.slug}
        workspaceName={workspace.name}
        currentPage="Notifikationer"
      />

      <div className="flex-1">
        <NotificationsTable />
      </div>
    </div>
  );
}
