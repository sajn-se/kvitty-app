import type { Metadata } from "next";
import { db } from "@/lib/db";
import { workspaces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { MembersList } from "@/components/members/members-list";
import { PendingInvites } from "@/components/members/pending-invites";
import { InviteForm } from "@/components/members/invite-form";
import { AllowedEmailsSection } from "@/components/members/allowed-emails-section";

export const metadata: Metadata = {
  title: "Medlemmar — Kvitty",
};

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  const session = await getSession();
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
        currentPage="Medlemmar"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold">Medlemmar</h1>
          <p className="text-muted-foreground text-sm">
            Hantera medlemmar och inbjudningar
          </p>
        </div>

        <MembersList workspaceId={workspace.id} currentUserId={session?.user?.id} />
        <PendingInvites workspaceId={workspace.id} />
        <InviteForm workspaceId={workspace.id} workspaceSlug={workspaceSlug} />
        <AllowedEmailsSection
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          inboxEmailSlug={workspace.inboxEmailSlug}
        />
      </div>
    </>
  );
}

