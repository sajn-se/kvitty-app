import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, workspaceMembers, fiscalPeriods } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IncomeStatementClient } from "./income-statement-client";

export const metadata: Metadata = {
  title: "Resultatrapport - Kvitty",
};

export default async function IncomeStatementPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { workspaceSlug } = await params;
  const { period: periodId } = await searchParams;

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

  // Default to most recent period if none selected
  const selectedPeriodId = periodId || periods[0]?.id;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 mt-1.5"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${workspaceSlug}`}>
                  {workspace.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${workspaceSlug}/rapporter/resultat`}>
                  Rapporter
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Resultatrapport</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div>
          <h1 className="text-2xl font-bold">Resultatrapport</h1>
          <p className="text-muted-foreground text-sm">
            Översikt över intäkter och kostnader
          </p>
        </div>

        {periods.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Inga räkenskapsperioder finns.</p>
            <p className="text-sm mt-1">
              Skapa en period för att se resultatrapporten.
            </p>
          </div>
        ) : (
          <IncomeStatementClient
            workspaceId={workspace.id}
            periods={periods.map((p) => ({
              id: p.id,
              label: p.label,
              startDate: p.startDate,
              endDate: p.endDate,
              isLocked: p.isLocked,
            }))}
            selectedPeriodId={selectedPeriodId}
            workspaceSlug={workspaceSlug}
          />
        )}
      </div>
    </>
  );
}
