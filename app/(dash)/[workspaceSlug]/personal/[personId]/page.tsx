import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { workspaces, employees, payrollEntries, payrollRuns } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { decrypt } from "@/lib/utils/encryption";
import { calculateAgeFromPersonnummer } from "@/lib/utils";
import { PersonalDetailClient } from "./personal-detail-client";
import { PersonalDetailActions } from "./personal-detail-actions";

export default async function PersonalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; personId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const { workspaceSlug, personId } = await params;
  const { year } = await searchParams;

  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, workspaceSlug),
  });

  if (!workspace) {
    notFound();
  }

  const employee = await db.query.employees.findFirst({
    where: and(eq(employees.id, personId), eq(employees.workspaceId, workspace.id)),
  });

  if (!employee) {
    notFound();
  }

  const allEntries = await db.query.payrollEntries.findMany({
    where: eq(payrollEntries.employeeId, personId),
    with: {
      payrollRun: {
        with: {
          fiscalPeriod: true,
        },
      },
    },
  });

  const sortedEntries = allEntries.sort((a, b) => {
    const periodCompare = b.payrollRun.period.localeCompare(a.payrollRun.period);
    if (periodCompare !== 0) return periodCompare;
    return b.payrollRun.runNumber - a.payrollRun.runNumber;
  });

  const filteredEntries = year
    ? sortedEntries.filter((entry) => entry.payrollRun.period.startsWith(year))
    : sortedEntries;

  const stats = await db
    .select({
      year: sql<string>`SUBSTRING(${payrollRuns.period}, 1, 4)`,
      totalGross: sql<string>`COALESCE(SUM(${payrollEntries.grossSalary}), 0)`,
      totalNet: sql<string>`COALESCE(SUM(${payrollEntries.netSalary}), 0)`,
      totalTax: sql<string>`COALESCE(SUM(${payrollEntries.taxDeduction}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(payrollEntries)
    .innerJoin(payrollRuns, eq(payrollEntries.payrollRunId, payrollRuns.id))
    .where(eq(payrollEntries.employeeId, personId))
    .groupBy(sql`SUBSTRING(${payrollRuns.period}, 1, 4)`)
    .orderBy(sql`SUBSTRING(${payrollRuns.period}, 1, 4) DESC`);

  const currentYearStats = year
    ? stats.find((s) => s.year === year)
    : stats.length > 0
      ? stats[0]
      : null;

  const decryptedPersonalNumber = decrypt(employee.personalNumber);
  const age = calculateAgeFromPersonnummer(decryptedPersonalNumber);

  const formatCurrency = (value: string | null) => {
    if (!value) return "0 kr";
    return `${parseFloat(value).toLocaleString("sv-SE")} kr`;
  };

  const availableYears = Array.from(
    new Set(
      allEntries.map((entry) => entry.payrollRun.period.substring(0, 4))
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 flex-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${workspaceSlug}/personal`}>
                  Personal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {employee.firstName} {employee.lastName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4">
          <PersonalDetailActions
            employee={{
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              phone: employee.phone,
              address: employee.address,
              postalCode: employee.postalCode,
              city: employee.city,
              taxTable: employee.taxTable,
              taxColumn: employee.taxColumn,
              employmentStartDate: employee.employmentStartDate,
              employmentEndDate: employee.employmentEndDate,
              isActive: employee.isActive,
            }}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {decryptedPersonalNumber}
            {age !== null && ` — ${age} år`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Personnummer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm">{decryptedPersonalNumber}</p>
            </CardContent>
          </Card>

          {employee.email && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>E-post</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.email}</p>
              </CardContent>
            </Card>
          )}

          {employee.phone && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Telefon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{employee.phone}</p>
              </CardContent>
            </Card>
          )}

          {employee.address && (
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Adress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {employee.address}
                  {employee.postalCode && employee.city && (
                    <>
                      <br />
                      {employee.postalCode} {employee.city}
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {(employee.taxTable || employee.taxColumn || employee.employmentStartDate || employee.employmentEndDate) && (
          <Card>
            <CardHeader>
              <CardTitle>Skatt och anställningsinformation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {employee.taxTable && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Skattetabell</p>
                    <p className="font-semibold">{employee.taxTable}</p>
                  </div>
                )}
                {employee.taxColumn && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Skattkolumn</p>
                    <p className="font-semibold">{employee.taxColumn}</p>
                  </div>
                )}
                {employee.employmentStartDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Anställningsstart</p>
                    <p className="font-semibold">{employee.employmentStartDate}</p>
                  </div>
                )}
                {employee.employmentEndDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Anställningsslut</p>
                    <p className="font-semibold">{employee.employmentEndDate}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {stats.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    {year ? `Bruttolön ${year}` : "Bruttolön (totalt)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      year
                        ? currentYearStats?.totalGross || "0"
                        : stats.reduce((sum, s) => sum + parseFloat(s.totalGross), 0).toString()
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    {year ? `Nettolön ${year}` : "Nettolön (totalt)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      year
                        ? currentYearStats?.totalNet || "0"
                        : stats.reduce((sum, s) => sum + parseFloat(s.totalNet), 0).toString()
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    {year ? `Skatteavdrag ${year}` : "Skatteavdrag (totalt)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      year
                        ? currentYearStats?.totalTax || "0"
                        : stats.reduce((sum, s) => sum + parseFloat(s.totalTax), 0).toString()
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>
                    {year ? `Antal löner ${year}` : "Antal löner (totalt)"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {year
                      ? currentYearStats?.count || 0
                      : stats.reduce((sum, s) => sum + s.count, 0)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {!year && stats.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Löner per år</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.year}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-semibold text-lg mb-2">{stat.year}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bruttolön:</span>
                            <span className="font-mono">{formatCurrency(stat.totalGross)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Nettolön:</span>
                            <span className="font-mono">{formatCurrency(stat.totalNet)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Antal löner:</span>
                            <span>{stat.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <PersonalDetailClient
          entries={filteredEntries}
          availableYears={availableYears}
          selectedYear={year}
          workspaceSlug={workspaceSlug}
        />
      </div>
    </>
  );
}

