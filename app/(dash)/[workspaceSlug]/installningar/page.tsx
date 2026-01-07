import type { Metadata } from "next";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/layout/page-header";
import { WorkspaceSettingsForm } from "@/components/settings/workspace-settings-form";

export const metadata: Metadata = {
  title: "Inställningar — Kvitty",
};

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    return null;
  }

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        currentPage="Inställningar"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold">Inställningar</h1>
          <p className="text-muted-foreground text-sm">
            Hantera arbetsytans inställningar
          </p>
        </div>

        <WorkspaceSettingsForm workspace={workspace} />
      </div>
    </>
  );
}

