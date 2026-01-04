"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { BalanceSheetTable } from "@/components/reports/report-table";
import { PeriodSelector } from "@/components/reports/period-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Warning } from "@phosphor-icons/react";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface BalanceSheetClientProps {
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

export function BalanceSheetClient({
  workspaceId,
  periods,
  selectedPeriodId,
  workspaceSlug,
}: BalanceSheetClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, isError, error } = trpc.reports.balanceSheet.useQuery(
    {
      workspaceId,
      fiscalPeriodId: selectedPeriodId,
    },
    { enabled: !!selectedPeriodId }
  );

  const handlePeriodChange = (periodId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", periodId);
    router.push(`/${workspaceSlug}/rapporter/balans?${params.toString()}`);
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
        <AlertTitle>Kunde inte ladda balansräkning</AlertTitle>
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

        <div className="flex items-center gap-4">
          {data?.period && (
            <div className="text-sm text-muted-foreground">
              Per {data.period.endDate}
            </div>
          )}
          {data?.isBalanced !== undefined && (
            data.isBalanced ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="size-3" />
                Balanserad
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <Warning className="size-3" />
                Ej balanserad
              </Badge>
            )
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tillgångar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.assets.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eget kapital & Skulder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.equityLiabilities.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Differens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data?.isBalanced ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(
                (data?.assets.total || 0) - (data?.equityLiabilities.total || 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance sheet table */}
      <Card>
        <CardHeader>
          <CardTitle>Balansräkning</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.assets.groups && data?.equityLiabilities.groups ? (
            <BalanceSheetTable
              leftTitle="Tillgångar"
              leftGroups={data.assets.groups}
              leftTotal={data.assets.total}
              rightTitle="Eget kapital & Skulder"
              rightGroups={data.equityLiabilities.groups}
              rightTotal={data.equityLiabilities.total}
              showAccountNumbers={true}
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
