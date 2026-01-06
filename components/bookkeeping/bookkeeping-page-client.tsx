"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, CaretRight, CalendarBlank } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { AddJournalEntryDialog } from "@/components/journal-entry/add-journal-entry-dialog";
import { formatCurrency } from "@/lib/utils";

interface BookkeepingPageClientProps {
  workspaceSlug: string;
  initialPeriodId: string;
}

export function BookkeepingPageClient({
  workspaceSlug,
  initialPeriodId,
}: BookkeepingPageClientProps) {
  const { workspace, periods } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addEntryOpen, setAddEntryOpen] = useState(false);

  // Get current period - default to most recent if not specified
  const currentPeriodId = useMemo(() => {
    if (initialPeriodId && periods.find((p) => p.id === initialPeriodId)) {
      return initialPeriodId;
    }
    // Find the period that contains today's date
    const today = new Date().toISOString().split("T")[0];
    const currentPeriod = periods.find(
      (p) => p.startDate <= today && p.endDate >= today
    );
    return currentPeriod?.id || periods[0]?.id || "";
  }, [initialPeriodId, periods]);

  const currentPeriod = periods.find((p) => p.id === currentPeriodId);

  // Handle period change
  const handlePeriodChange = (periodId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodId", periodId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Fetch journal entries for the selected period
  const { data: entries, isLoading } = trpc.journalEntries.list.useQuery(
    {
      workspaceId: workspace.id,
      fiscalPeriodId: currentPeriodId,
      limit: 100,
      offset: 0,
    },
    {
      enabled: !!currentPeriodId,
    }
  );

  if (periods.length === 0) {
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
                  <BreadcrumbPage>Bokforing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarBlank
                className="size-12 mx-auto mb-4 text-muted-foreground"
                weight="duotone"
              />
              <h3 className="font-medium mb-2">Ingen rakenskapsperiod</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Du maste skapa en rakenskapsperiod innan du kan borja bokfora.
              </p>
              <Button asChild>
                <Link href={`/${workspaceSlug}/perioder`}>
                  Skapa rakenskapsperiod
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

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
                <BreadcrumbPage>Bokforing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Verifikationer</h1>
            <p className="text-muted-foreground text-sm">
              Bokfor transaktioner med dubbel bokforing
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <Select value={currentPeriodId} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Valj period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => setAddEntryOpen(true)}>
              <Plus className="size-4 mr-2" />
              Ny verifikation
            </Button>
          </div>
        </div>

        {/* Period info */}
        {currentPeriod && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarBlank className="size-4" weight="duotone" />
            <span>
              {currentPeriod.startDate} - {currentPeriod.endDate}
            </span>
            <Badge variant="outline" className="ml-2">
              {currentPeriod.fiscalYearType === "calendar"
                ? "Kalenderår"
                : "Brutet rakenskapsar"}
            </Badge>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="size-8" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!entries || entries.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText
                className="size-12 mx-auto mb-4 text-muted-foreground"
                weight="duotone"
              />
              <h3 className="font-medium mb-2">Inga verifikationer</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Skapa en verifikation for att borja bokfora i{" "}
                {currentPeriod?.label}.
              </p>
              <Button onClick={() => setAddEntryOpen(true)}>
                <Plus className="size-4 mr-2" />
                Ny verifikation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Journal entries table */}
        {!isLoading && entries && entries.length > 0 && (
          <>
            <div className="text-sm text-muted-foreground">
              {entries.length} verifikationer
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 w-[80px]">Nr</TableHead>
                    <TableHead className="px-4 w-[100px]">Datum</TableHead>
                    <TableHead className="px-4">Beskrivning</TableHead>
                    <TableHead className="px-4">Typ</TableHead>
                    <TableHead className="px-4 text-right">Belopp</TableHead>
                    <TableHead className="px-4 w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const totalDebit = entry.lines.reduce(
                      (sum, l) => sum + parseFloat(l.debit || "0"),
                      0
                    );

                    return (
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="px-4 font-mono">
                          V{entry.verificationNumber}
                        </TableCell>
                        <TableCell className="px-4 text-muted-foreground">
                          {entry.entryDate}
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="font-medium">{entry.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.lines.length} konteringar
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge variant="secondary">
                            {getEntryTypeLabel(entry.entryType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 text-right font-mono">
                          {formatCurrency(totalDebit)}
                        </TableCell>
                        <TableCell className="px-4">
                          <CaretRight className="size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </>
        )}
      </div>

      {/* Add journal entry dialog */}
      {addEntryOpen && (
        <AddJournalEntryDialog
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          periods={periods}
          open={addEntryOpen}
          onOpenChange={setAddEntryOpen}
          defaultPeriodId={currentPeriodId}
        />
      )}
    </>
  );
}

function getEntryTypeLabel(type: string): string {
  switch (type) {
    case "kvitto":
      return "Kvitto";
    case "inkomst":
      return "Inkomst";
    case "leverantorsfaktura":
      return "Leverantorsfaktura";
    case "lonekorning":
      return "Lonekorning";
    default:
      return "Annat";
  }
}
