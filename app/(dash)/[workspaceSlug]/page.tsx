import { db } from "@/lib/db";
import { workspaces, fiscalPeriods, verifications, auditLogs, user } from "@/lib/db/schema";
import { eq, count, sum, desc, sql } from "drizzle-orm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { VerificationChart } from "@/components/dashboard/verification-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PeriodsList } from "@/components/dashboard/periods-list";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    return null;
  }

  // Fetch all data in parallel
  const [periods, recentVerifications, recentAuditLogs] = await Promise.all([
    // Periods with verification counts
    db.query.fiscalPeriods.findMany({
      where: eq(fiscalPeriods.workspaceId, workspace.id),
      orderBy: (periods, { desc }) => [desc(periods.startDate)],
    }),
    // Recent verifications
    db.query.verifications.findMany({
      where: eq(verifications.workspaceId, workspace.id),
      orderBy: (v, { desc }) => [desc(v.createdAt)],
      limit: 6,
      with: {
        createdByUser: { columns: { id: true, name: true, email: true } },
        fiscalPeriod: { columns: { label: true, urlSlug: true } },
      },
    }),
    // Recent audit logs
    db.query.auditLogs.findMany({
      where: eq(auditLogs.workspaceId, workspace.id),
      orderBy: (a, { desc }) => [desc(a.timestamp)],
      limit: 4,
      with: {
        user: { columns: { id: true, name: true, email: true } },
      },
    }),
  ]);

  // Get verification counts per period
  const periodStats = await Promise.all(
    periods.map(async (period) => {
      const [result] = await db
        .select({ count: count() })
        .from(verifications)
        .where(eq(verifications.fiscalPeriodId, period.id));
      return {
        ...period,
        verificationCount: result?.count || 0,
      };
    })
  );

  // Calculate aggregate stats for current period
  const currentPeriod = periodStats[0];
  let stats = {
    totalAmount: 0,
    verificationCount: 0,
    latestBalance: null as number | null,
  };

  if (currentPeriod) {
    const [aggregates] = await db
      .select({
        totalAmount: sql<string>`COALESCE(SUM(CAST(${verifications.amount} AS DECIMAL)), 0)`,
        count: count(),
      })
      .from(verifications)
      .where(eq(verifications.fiscalPeriodId, currentPeriod.id));

    // Get latest balance
    const latestVerification = await db.query.verifications.findFirst({
      where: eq(verifications.fiscalPeriodId, currentPeriod.id),
      orderBy: (v, { desc }) => [desc(v.accountingDate), desc(v.createdAt)],
      columns: { bookedBalance: true },
    });

    stats = {
      totalAmount: parseFloat(aggregates?.totalAmount || "0"),
      verificationCount: aggregates?.count || 0,
      latestBalance: latestVerification?.bookedBalance
        ? parseFloat(latestVerification.bookedBalance)
        : null,
    };
  }

  // Get chart data - monthly aggregation for current period
  let chartData: { month: string; amount: number }[] = [];
  if (currentPeriod) {
    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${verifications.accountingDate}, 'Mon')`,
        monthNum: sql<string>`TO_CHAR(${verifications.accountingDate}, 'MM')`,
        amount: sql<number>`COALESCE(SUM(ABS(CAST(${verifications.amount} AS DECIMAL))), 0)`,
      })
      .from(verifications)
      .where(eq(verifications.fiscalPeriodId, currentPeriod.id))
      .groupBy(
        sql`TO_CHAR(${verifications.accountingDate}, 'Mon')`,
        sql`TO_CHAR(${verifications.accountingDate}, 'MM')`
      )
      .orderBy(sql`TO_CHAR(${verifications.accountingDate}, 'MM')`);

    chartData = monthlyData.map((d) => ({
      month: d.month,
      amount: Number(d.amount),
    }));
  }

  // Combine activity items
  const activityItems = [
    ...recentVerifications.map((v) => ({
      id: v.id,
      type: "verification" as const,
      reference: v.reference,
      amount: v.amount,
      periodLabel: v.fiscalPeriod?.label,
      periodSlug: v.fiscalPeriod?.urlSlug,
      userName: v.createdByUser?.name || v.createdByUser?.email,
      timestamp: v.createdAt,
    })),
    ...recentAuditLogs.map((log) => ({
      id: log.id,
      type: "audit" as const,
      action: log.action,
      entityType: log.entityType,
      userName: log.user?.name || log.user?.email,
      timestamp: log.timestamp,
    })),
  ]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

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
              <BreadcrumbItem>
                <BreadcrumbPage>{workspace.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{workspace.name}</h1>
          <p className="text-muted-foreground text-sm">Översikt</p>
        </div>

        {/* Metrics Row */}
        <DashboardMetrics
          totalAmount={stats.totalAmount}
          verificationCount={stats.verificationCount}
          latestBalance={stats.latestBalance}
          periodLabel={currentPeriod?.label}
        />

        {/* Chart */}
        <VerificationChart data={chartData} />

        {/* Two Column: Activity + Periods */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityFeed items={activityItems} workspaceSlug={workspaceSlug} />
          <PeriodsList
            periods={periodStats}
            workspaceSlug={workspaceSlug}
            currentPeriodId={currentPeriod?.id}
          />
        </div>
      </div>
    </>
  );
}
