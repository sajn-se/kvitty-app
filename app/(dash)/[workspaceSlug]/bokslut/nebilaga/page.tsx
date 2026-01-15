import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, fiscalPeriods } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { NebilagaPageClient } from "./nebilaga-client";

interface NebilagaPageProps {
  params: Promise<{
    workspaceSlug: string;
  }>;
  searchParams: Promise<{
    period?: string;
  }>;
}

export default async function NebilagaPage({
  params,
  searchParams,
}: NebilagaPageProps) {
  const { workspaceSlug } = await params;
  const { period: periodParam } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Get workspace with membership check
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    notFound();
  }

  // Check membership
  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspace.id),
      eq(workspaceMembers.userId, session.user.id)
    ),
  });

  if (!membership) {
    notFound();
  }

  // Check if workspace is enskild_firma
  if (workspace.businessType !== "enskild_firma") {
    redirect(`/${workspaceSlug}/bokslut`);
  }

  // Get fiscal periods
  const periods = await db.query.fiscalPeriods.findMany({
    where: eq(fiscalPeriods.workspaceId, workspace.id),
    orderBy: [desc(fiscalPeriods.startDate)],
  });

  if (periods.length === 0) {
    redirect(`/${workspaceSlug}/perioder`);
  }

  // Determine selected period
  const selectedPeriodId =
    periodParam || periods.find((p) => p.isLocked)?.id || periods[0].id;

  return (
    <div className="container max-w-5xl py-6">
      <NebilagaPageClient
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        periods={periods.map((p) => ({
          id: p.id,
          label: p.label,
          startDate: p.startDate,
          endDate: p.endDate,
          isLocked: p.isLocked,
        }))}
        defaultPeriodId={selectedPeriodId}
      />
    </div>
  );
}
