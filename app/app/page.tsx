import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { workspaceMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AppPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const memberships = await db.query.workspaceMembers.findMany({
    where: eq(workspaceMembers.userId, session.user.id),
    with: {
      workspace: true,
    },
  });

  if (memberships.length > 0) {
    redirect(`/${memberships[0].workspace.slug}`);
  }

  redirect("/");
}

