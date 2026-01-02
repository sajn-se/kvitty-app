import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, fiscalPeriods, verifications } from "@/lib/db/schema";
import { eq, and, ilike, gte, lte, or } from "drizzle-orm";
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
import { VerificationsTable } from "@/components/verifications/verifications-table";
import { AddVerificationButton } from "@/components/verifications/add-verification-button";
import { VerificationFilterBar } from "@/components/verifications/verification-filter-bar";

export default async function PeriodPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; periodSlug: string }>;
  searchParams: Promise<{ search?: string; dateFrom?: string; dateTo?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const { workspaceSlug, periodSlug } = await params;
  const { search, dateFrom, dateTo } = await searchParams;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    notFound();
  }

  const period = await db.query.fiscalPeriods.findFirst({
    where: and(
      eq(fiscalPeriods.workspaceId, workspace.id),
      eq(fiscalPeriods.urlSlug, periodSlug)
    ),
  });

  if (!period) {
    notFound();
  }

  // Build filter conditions
  const conditions = [eq(verifications.fiscalPeriodId, period.id)];

  if (search) {
    conditions.push(
      or(
        ilike(verifications.reference, `%${search}%`),
        ilike(verifications.office, `%${search}%`)
      )!
    );
  }

  if (dateFrom) {
    conditions.push(gte(verifications.accountingDate, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(verifications.accountingDate, dateTo));
  }

  const data = await db.query.verifications.findMany({
    where: and(...conditions),
    orderBy: (v, { desc }) => [desc(v.accountingDate), desc(v.createdAt)],
    with: {
      createdByUser: {
        columns: { id: true, name: true, email: true },
      },
    },
  });

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${workspaceSlug}`}>
                  {workspace.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{period.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{period.label}</h1>
            <p className="text-muted-foreground text-sm">
              {period.startDate} — {period.endDate}
            </p>
          </div>
          <AddVerificationButton
            workspaceId={workspace.id}
            periodId={period.id}
          />
        </div>
        <VerificationFilterBar
          search={search ?? ""}
          dateFrom={dateFrom ?? ""}
          dateTo={dateTo ?? ""}
        />
        <VerificationsTable
          data={data}
          workspaceId={workspace.id}
          hasFilters={!!(search || dateFrom || dateTo)}
        />
      </div>
    </>
  );
}
