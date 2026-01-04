"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PeriodSelector } from "@/components/reports/period-selector";
import { VatPaymentInfo } from "@/components/reports/vat-payment-info";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Warning } from "@phosphor-icons/react";

interface Period {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

interface VatReportClientProps {
  workspaceId: string;
  periods: Period[];
  selectedPeriodId: string;
  selectedVatPeriodIndex: number;
  workspaceSlug: string;
  vatReportingFrequency: "monthly" | "quarterly" | "yearly";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function VatReportClient({
  workspaceId,
  periods,
  selectedPeriodId,
  selectedVatPeriodIndex,
  workspaceSlug,
  vatReportingFrequency,
}: VatReportClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: vatPeriods, isLoading: periodsLoading, isError: periodsError, error: periodsErrorData } =
    trpc.reports.vatPeriods.useQuery(
      {
        workspaceId,
        fiscalPeriodId: selectedPeriodId,
      },
      { enabled: !!selectedPeriodId }
    );

  const { data: vatReport, isLoading: reportLoading, isError: reportError, error: reportErrorData } =
    trpc.reports.vatReport.useQuery(
      {
        workspaceId,
        fiscalPeriodId: selectedPeriodId,
        periodIndex: selectedVatPeriodIndex,
      },
      { enabled: !!selectedPeriodId }
    );

  const handlePeriodChange = (periodId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", periodId);
    params.delete("vatPeriod");
    router.push(`/${workspaceSlug}/rapporter/moms?${params.toString()}`);
  };

  const handleVatPeriodChange = (index: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("vatPeriod", index);
    router.push(`/${workspaceSlug}/rapporter/moms?${params.toString()}`);
  };

  const isLoading = periodsLoading || reportLoading;
  const isError = periodsError || reportError;
  const error = periodsErrorData || reportErrorData;

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
        <AlertTitle>Kunde inte ladda momsrapport</AlertTitle>
        <AlertDescription>
          {error?.message || "Ett oväntat fel uppstod. Försök igen."}
        </AlertDescription>
      </Alert>
    );
  }

  const frequencyLabel =
    vatReportingFrequency === "monthly"
      ? "Månadsvis"
      : vatReportingFrequency === "quarterly"
        ? "Kvartalsvis"
        : "Årsvis";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <PeriodSelector
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          onPeriodChange={handlePeriodChange}
        />

        {vatPeriods && vatPeriods.length > 1 && (
          <Select
            value={selectedVatPeriodIndex.toString()}
            onValueChange={handleVatPeriodChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Välj momsperiod" />
            </SelectTrigger>
            <SelectContent>
              {vatPeriods.map((vp) => (
                <SelectItem key={vp.index} value={vp.index.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{vp.label}</span>
                    {vp.isPast && (
                      <Badge variant="outline" className="text-xs">
                        Passerad
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Badge variant="secondary">{frequencyLabel} momsrapportering</Badge>
      </div>

      {vatReport && (
        <>
          {/* Payment info card */}
          <VatPaymentInfo
            netVat={vatReport.netVat}
            deadline={vatReport.deadline}
            bankgiro={vatReport.payment.bankgiro}
            recipient={vatReport.payment.recipient}
            isPeriodLocked={vatReport.fiscalPeriod.isLocked}
          />

          {/* VAT breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Utgående moms</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Momssats</TableHead>
                      <TableHead className="text-right">Belopp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Moms 25%</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.outputVat.vat25)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Moms 12%</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.outputVat.vat12)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Moms 6%</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.outputVat.vat6)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Summa utgående moms</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.outputVat.total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingående moms</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Beskrivning</TableHead>
                      <TableHead className="text-right">Belopp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ingående moms inköp</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.inputVat)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Summa ingående moms</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(vatReport.inputVat)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sammanställning</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Utgående moms
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(vatReport.outputVat.total)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Ingående moms (avdrag)
                    </TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      - {formatCurrency(vatReport.inputVat)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="text-lg font-bold border-t-2">
                    <TableCell>
                      {vatReport.netVat >= 0
                        ? "Moms att betala"
                        : "Moms att få tillbaka"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-mono ${
                        vatReport.netVat >= 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(Math.abs(vatReport.netVat))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!vatReport && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Ingen momsdata för denna period.</p>
        </div>
      )}
    </div>
  );
}
