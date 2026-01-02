import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, fiscalPeriods } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SetUserCookie } from "@/components/set-user-cookie";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { workspaceSlug } = await params;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    notFound();
  }

  // Verify user has access
  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, session.user.id)
    ),
  });

  if (!membership) {
    notFound();
  }

  // Get all periods for this workspace
  const periods = await db.query.fiscalPeriods.findMany({
    where: eq(fiscalPeriods.workspaceId, workspace.id),
    orderBy: (periods, { desc }) => [desc(periods.startDate)],
  });

  // Get all user's workspaces for the switcher
  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
    with: {
      workspace: true,
    },
  });

  const userWorkspaces = memberships.map((m) => m.workspace);

  return (
    <WorkspaceProvider workspace={workspace} periods={periods}>
      <SetUserCookie slug={workspace.slug} name={workspace.name} />
      <AppSidebar
        workspace={workspace}
        workspaces={userWorkspaces}
        periods={periods}
        user={session.user}
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </WorkspaceProvider>
  );
}
