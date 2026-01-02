import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";

export default async function DashboardRootPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Get user's workspaces
  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
    with: {
      workspace: true,
    },
  });

  // If user has workspaces, redirect to first one
  if (memberships.length > 0) {
    redirect(`/${memberships[0].workspace.slug}`);
  }

  // Otherwise show create workspace form
  return <CreateWorkspaceForm />;
}
