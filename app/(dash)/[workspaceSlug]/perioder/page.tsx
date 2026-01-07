import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, fiscalPeriods } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { PeriodsTable } from "@/components/periods/periods-table";

export const metadata: Metadata = {
  title: "Perioder — Kvitty",
};

export default async function PeriodsPage({
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

  const allPeriods = await db.query.fiscalPeriods.findMany({
    where: eq(fiscalPeriods.workspaceId, workspace.id),
    orderBy: (periods, { desc }) => [desc(periods.startDate)],
  });

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        currentPage="Perioder"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold">Perioder</h1>
          <p className="text-muted-foreground text-sm">
            Alla räkenskapsperioder för detta arbetsområde
          </p>
        </div>

        <div className="rounded-lg border">
          <PeriodsTable
            periods={allPeriods.map((period) => ({
              id: period.id,
              label: period.label,
              urlSlug: period.urlSlug,
              startDate: period.startDate,
              endDate: period.endDate,
              isLocked: period.isLocked,
              lockedAt: period.lockedAt,
            }))}
            workspaceSlug={workspaceSlug}
          />
        </div>
      </div>
    </>
  );
}
