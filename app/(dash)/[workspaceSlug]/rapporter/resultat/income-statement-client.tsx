"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ReportTable } from "@/components/reports/report-table";
import { PeriodSelector } from "@/components/reports/period-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Warning } from "@phosphor-icons/react";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface IncomeStatementClientProps {
  workspaceId: string;
  periods: Period[];
  selectedPeriodId: string;
  workspaceSlug: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function IncomeStatementClient({
  workspaceId,
  periods,
  selectedPeriodId,
  workspaceSlug,
}: IncomeStatementClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, isError, error } = trpc.reports.incomeStatement.useQuery(
    {
      workspaceId,
      fiscalPeriodId: selectedPeriodId,
    },
    { enabled: !!selectedPeriodId }
  );

  const handlePeriodChange = (periodId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", periodId);
    router.push(`/${workspaceSlug}/rapporter/resultat?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Warning className="size-4" />
        <AlertTitle>Kunde inte ladda resultaträkning</AlertTitle>
        <AlertDescription>
          {error?.message || "Ett oväntat fel uppstod. Försök igen."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onPeriodChange={handlePeriodChange}
        />

        {data?.period && (
          <div className="text-sm text-muted-foreground">
            {data.period.startDate} - {data.period.endDate}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Intäkter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data?.totals.revenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kostnader
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data?.totals.expenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resultat före skatt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (data?.totals.profitBeforeTax || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(data?.totals.profitBeforeTax || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Årets resultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (data?.totals.profit || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(data?.totals.profit || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full report table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultaträkning</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.groups && data.groups.length > 0 ? (
            <ReportTable
              groups={data.groups}
              showAccountNumbers={true}
              totalLabel="Årets resultat"
              total={data.totals.profit}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Inga transaktioner under denna period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
