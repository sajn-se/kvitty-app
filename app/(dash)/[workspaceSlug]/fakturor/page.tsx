import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { InvoicesPageClient } from "@/components/invoices/invoices-page-client";

export const metadata: Metadata = {
  title: "Fakturor — Kvitty",
};

export default async function InvoicesPage({
  params,
}: {
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

  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, session.user.id)
    ),
  });

  if (!membership) {
    redirect("/app");
  }

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        currentPage="Fakturor"
      />
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <InvoicesPageClient />
      </div>
    </>
  );
}
