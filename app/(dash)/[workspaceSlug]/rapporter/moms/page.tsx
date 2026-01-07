import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, fiscalPeriods } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { VatReportClient } from "./vat-report-client";

export const metadata: Metadata = {
  title: "Momsrapport - Kvitty",
};

export default async function VatReportPage({
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

  const periods = await db.query.fiscalPeriods.findMany({
    where: eq(fiscalPeriods.workspaceId, workspace.id),
    orderBy: [desc(fiscalPeriods.startDate)],
  });

  const defaultPeriodId = periods[0]?.id ?? "";
  const defaultVatPeriodIndex = 0;

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        breadcrumbs={[{ label: "Rapporter", href: `/${workspaceSlug}/rapporter/moms` }]}
        currentPage="Momsrapport"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold">Momsrapport</h1>
          <p className="text-muted-foreground text-sm">
            Översikt över moms att deklarera och betala
          </p>
        </div>

        {periods.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Inga räkenskapsperioder finns.</p>
            <p className="text-sm mt-1">
              Skapa en period för att se momsrapporten.
            </p>
          </div>
        ) : (
          <VatReportClient
            workspaceId={workspace.id}
            periods={periods.map((p) => ({
              id: p.id,
              label: p.label,
              startDate: p.startDate,
              endDate: p.endDate,
              isLocked: p.isLocked,
            }))}
            defaultPeriodId={defaultPeriodId}
            defaultVatPeriodIndex={defaultVatPeriodIndex}
            vatReportingFrequency={workspace.vatReportingFrequency || "quarterly"}
          />
        )}
      </div>
    </>
  );
}
