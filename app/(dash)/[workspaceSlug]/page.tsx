import type { Metadata } from "next";
import { db } from "@/lib/db";
import { workspaces, fiscalPeriods, bankTransactions, journalEntries, attachments, auditLogs } from "@/lib/db/schema";
import { eq, count, sql, and, gte } from "drizzle-orm";
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
import { AGIDeadlinesWidget } from "@/components/dashboard/agi-deadlines-widget";
import { OverdueInvoicesWidget } from "@/components/dashboard/overdue-invoices-widget";
import { SimpleDashboardMetrics } from "@/components/dashboard/simple-dashboard-metrics";
import { SimpleVerificationChart } from "@/components/dashboard/simple-verification-chart";
import { SimpleActivityFeed } from "@/components/dashboard/simple-activity-feed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}): Promise<Metadata> {
  const { workspaceSlug } = await params;
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });
  return {
    title: workspace ? `${workspace.name} — Kvitty` : "Översikt — Kvitty",
  };
}

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

  // Get current date info
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentYearStart = `${today.getFullYear()}-01-01`;

  // Fetch periods for both modes
  const periods = await db.query.fiscalPeriods.findMany({
    where: eq(fiscalPeriods.workspaceId, workspace.id),
    orderBy: (periods, { desc }) => [desc(periods.startDate)],
  });

  // Get current period based on today's date
  const currentPeriod = periods.find(
    (p) => p.startDate <= todayStr && p.endDate >= todayStr
  );

  // Simple mode dashboard
  if (workspace.mode === "simple") {
    const statsDateFrom = currentPeriod?.startDate || currentYearStart;

    // Fetch simple mode data in parallel
    const [
      totalTransactions,
      periodTransactions,
      totalAttachments,
      recentTransactions,
      periodStats,
      monthlyTransactions,
    ] = await Promise.all([
      // Total bank transactions count
      db
        .select({ count: count() })
        .from(bankTransactions)
        .where(eq(bankTransactions.workspaceId, workspace.id))
        .then(([r]) => r?.count || 0),
      // Current period transactions (based on accounting date within period)
      currentPeriod
        ? db
            .select({ count: count() })
            .from(bankTransactions)
            .where(
              and(
                eq(bankTransactions.workspaceId, workspace.id),
                gte(bankTransactions.accountingDate, currentPeriod.startDate),
                sql`${bankTransactions.accountingDate} <= ${currentPeriod.endDate}`
              )
            )
            .then(([r]) => r?.count || 0)
        : Promise.resolve(0),
      // Total attachments count
      db
        .select({ count: count() })
        .from(attachments)
        .innerJoin(bankTransactions, eq(attachments.bankTransactionId, bankTransactions.id))
        .where(eq(bankTransactions.workspaceId, workspace.id))
        .then(([r]) => r?.count || 0),
      // Recent transactions with attachment counts
      db.query.bankTransactions.findMany({
        where: eq(bankTransactions.workspaceId, workspace.id),
        orderBy: (txns, { desc }) => [desc(txns.createdAt)],
        limit: 8,
        with: {
          createdByUser: { columns: { id: true, name: true, email: true } },
          attachments: { columns: { id: true } },
        },
      }),
      // Period stats with transaction counts
      Promise.all(
        periods.map(async (period) => {
          const [result] = await db
            .select({ count: count() })
            .from(bankTransactions)
            .where(
              and(
                eq(bankTransactions.workspaceId, workspace.id),
                gte(bankTransactions.accountingDate, period.startDate),
                sql`${bankTransactions.accountingDate} <= ${period.endDate}`
              )
            );
          return {
            ...period,
            verificationCount: result?.count || 0,
          };
        })
      ),
      // Monthly transaction counts for chart
      db
        .select({
          month: sql<string>`TO_CHAR(${bankTransactions.accountingDate}, 'Mon')`,
          monthNum: sql<string>`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`,
          count: count(),
        })
        .from(bankTransactions)
        .where(
          and(
            eq(bankTransactions.workspaceId, workspace.id),
            gte(bankTransactions.accountingDate, statsDateFrom)
          )
        )
        .groupBy(
          sql`TO_CHAR(${bankTransactions.accountingDate}, 'Mon')`,
          sql`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`
        )
        .orderBy(sql`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`),
    ]);

    const simpleChartData = monthlyTransactions.map((d) => ({
      month: d.month,
      count: Number(d.count),
    }));

    const simpleActivityItems = recentTransactions.map((t) => ({
      id: t.id,
      reference: t.reference,
      amount: t.amount,
      accountingDate: t.accountingDate,
      attachmentCount: t.attachments?.length || 0,
      createdByName: t.createdByUser?.name || t.createdByUser?.email,
      createdAt: t.createdAt,
    }));

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
          <SimpleDashboardMetrics
            totalTransactions={totalTransactions}
            periodTransactions={periodTransactions}
            totalAttachments={totalAttachments}
            periodLabel={currentPeriod?.label}
          />

          {/* Chart */}
          <SimpleVerificationChart data={simpleChartData} />

          {/* Two Column: Activity + Periods */}
          <div className="grid gap-6 lg:grid-cols-2">
            <SimpleActivityFeed items={simpleActivityItems} workspaceSlug={workspaceSlug} />
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

  // Full bookkeeping mode dashboard (existing implementation)
  // Fetch all data in parallel
  const [recentBankTransactions, recentAuditLogs, periodStats] = await Promise.all([
    // Recent bank transactions (company-wide, no period filter)
    db.query.bankTransactions.findMany({
      where: eq(bankTransactions.workspaceId, workspace.id),
      orderBy: (v, { desc }) => [desc(v.createdAt)],
      limit: 6,
      with: {
        createdByUser: { columns: { id: true, name: true, email: true } },
        bankAccount: { columns: { id: true, name: true, accountNumber: true } },
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
    // Get journal entry counts per period (journal entries are still period-based)
    Promise.all(
      periods.map(async (period) => {
        const [result] = await db
          .select({ count: count() })
          .from(journalEntries)
          .where(eq(journalEntries.fiscalPeriodId, period.id));
        return {
          ...period,
          verificationCount: result?.count || 0,
        };
      })
    ),
  ]);

  // Use current period date range if available, otherwise current year
  const statsDateFrom = currentPeriod?.startDate || currentYearStart;

  // Calculate aggregate stats for the workspace
  const [aggregates] = await db
    .select({
      totalAmount: sql<string>`COALESCE(SUM(CAST(${bankTransactions.amount} AS DECIMAL)), 0)`,
      count: count(),
    })
    .from(bankTransactions)
    .where(
      and(
        eq(bankTransactions.workspaceId, workspace.id),
        gte(bankTransactions.accountingDate, statsDateFrom)
      )
    );

  // Get latest balance
  const latestTransaction = await db.query.bankTransactions.findFirst({
    where: eq(bankTransactions.workspaceId, workspace.id),
    orderBy: (v, { desc }) => [desc(v.accountingDate), desc(v.createdAt)],
    columns: { bookedBalance: true },
  });

  const stats = {
    totalAmount: parseFloat(aggregates?.totalAmount || "0"),
    transactionCount: aggregates?.count || 0,
    latestBalance: latestTransaction?.bookedBalance
      ? parseFloat(latestTransaction.bookedBalance)
      : null,
  };

  // Get chart data - monthly aggregation for current period/year
  const monthlyData = await db
    .select({
      month: sql<string>`TO_CHAR(${bankTransactions.accountingDate}, 'Mon')`,
      monthNum: sql<string>`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`,
      amount: sql<number>`COALESCE(SUM(ABS(CAST(${bankTransactions.amount} AS DECIMAL))), 0)`,
    })
    .from(bankTransactions)
    .where(
      and(
        eq(bankTransactions.workspaceId, workspace.id),
        gte(bankTransactions.accountingDate, statsDateFrom)
      )
    )
    .groupBy(
      sql`TO_CHAR(${bankTransactions.accountingDate}, 'Mon')`,
      sql`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`
    )
    .orderBy(sql`TO_CHAR(${bankTransactions.accountingDate}, 'MM')`);

  const chartData = monthlyData.map((d) => ({
    month: d.month,
    amount: Number(d.amount),
  }));

  // Combine activity items
  const activityItems = [
    ...recentBankTransactions.map((v) => ({
      id: v.id,
      type: "transaction" as const,
      reference: v.reference,
      amount: v.amount,
      bankAccountName: v.bankAccount?.name,
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
            className="mr-2 data-[orientation=vertical]:h-4 mt-1.5"
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
          verificationCount={stats.transactionCount}
          latestBalance={stats.latestBalance}
          periodLabel={currentPeriod?.label || today.getFullYear().toString()}
        />

        {/* Chart */}
        <VerificationChart data={chartData} />

        {/* Widgets Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AGIDeadlinesWidget workspaceId={workspace.id} workspaceSlug={workspaceSlug} />
          <OverdueInvoicesWidget workspaceId={workspace.id} workspaceSlug={workspaceSlug} />
        </div>

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
