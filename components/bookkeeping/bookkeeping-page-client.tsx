"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import Link from "next/link";
import { Plus, FileText, CaretRight, CalendarBlank, MagnifyingGlass, X, Upload } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { AddJournalEntryDialog } from "@/components/journal-entry/add-journal-entry-dialog";
import { VerificationDetailSheet } from "@/components/bookkeeping/verification-detail-sheet";
import { SIEImportDialog } from "@/components/bookkeeping/sie-import-dialog";
import { TablePagination } from "@/components/ui/table-pagination";
import { formatCurrency } from "@/lib/utils";

interface BookkeepingPageClientProps {
  workspaceSlug: string;
  initialPeriodId: string;
}

const DEFAULT_PAGE_SIZE = 20;

type JournalEntry = {
  id: string;
  verificationNumber: number;
  entryDate: string;
  description: string;
  entryType: string;
  fiscalPeriodId: string;
  createdAt?: Date | string;
  createdByUser?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  lines: Array<{
    id: string;
    accountNumber: number;
    accountName: string;
    debit: string | null;
    credit: string | null;
    description: string | null;
  }>;
};

export function BookkeepingPageClient({
  workspaceSlug,
  initialPeriodId,
}: BookkeepingPageClientProps) {
  const { workspace, periods } = useWorkspace();
  const [periodId, setPeriodId] = useQueryState("periodId", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [dateFrom, setDateFrom] = useQueryState("dateFrom", parseAsString.withDefault(""));
  const [dateTo, setDateTo] = useQueryState("dateTo", parseAsString.withDefault(""));
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [sieImportOpen, setSieImportOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Get current period - default to most recent if not specified
  const currentPeriodId = useMemo(() => {
    const effectivePeriodId = periodId || initialPeriodId;
    if (effectivePeriodId && periods.find((p) => p.id === effectivePeriodId)) {
      return effectivePeriodId;
    }
    // Find the period that contains today's date
    const today = new Date().toISOString().split("T")[0];
    const currentPeriod = periods.find(
      (p) => p.startDate <= today && p.endDate >= today
    );
    return currentPeriod?.id || periods[0]?.id || "";
  }, [periodId, initialPeriodId, periods]);

  const currentPeriod = periods.find((p) => p.id === currentPeriodId);

  // Handle period change
  const handlePeriodChange = (newPeriodId: string) => {
    setPeriodId(newPeriodId);
    setPage(1);
    // Reset filters when changing period
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  // Handle filter changes - reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const hasActiveFilters = search || dateFrom || dateTo;

  // Fetch journal entries for the selected period
  const { data, isLoading } = trpc.journalEntries.list.useQuery(
    {
      workspaceId: workspace.id,
      fiscalPeriodId: currentPeriodId,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    {
      enabled: !!currentPeriodId,
    }
  );

  const entries = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  if (periods.length === 0) {
    return (
      <>
        <PageHeader currentPage="Bokföring" />

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarBlank
                className="size-12 mx-auto mb-4 text-muted-foreground"
                weight="duotone"
              />
              <h3 className="font-medium mb-2">Ingen rakenskapsperiod</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Du maste skapa en rakenskapsperiod innan du kan borja bokföra.
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
      <PageHeader currentPage="Bokföring" />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Verifikationer</h1>
            <p className="text-muted-foreground text-sm">
              Bokför transaktioner med dubbel bokföring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <Select value={currentPeriodId} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Välj period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setSieImportOpen(true)}>
              <Upload className="size-4 mr-2" />
              Importera SIE
            </Button>

            <Button onClick={() => setAddEntryOpen(true)}>
              <Plus className="size-4 mr-2" />
              Ny verifikation
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px] max-w-sm">
            <Label htmlFor="search" className="text-xs text-muted-foreground mb-1.5 block">
              Sök
            </Label>
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Sök på beskrivning eller verifikationsnummer..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Date from */}
          <div className="w-[160px]">
            <Label htmlFor="dateFrom" className="text-xs text-muted-foreground mb-1.5 block">
              Fran datum
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              min={currentPeriod?.startDate}
              max={dateTo || currentPeriod?.endDate}
            />
          </div>

          {/* Date to */}
          <div className="w-[160px]">
            <Label htmlFor="dateTo" className="text-xs text-muted-foreground mb-1.5 block">
              Till datum
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              min={dateFrom || currentPeriod?.startDate}
              max={currentPeriod?.endDate}
            />
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="size-4 mr-1" />
              Rensa filter
            </Button>
          )}
        </div>

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
                Skapa en verifikation eller importera fran SIE-fil för att börja bokföra i{" "}
                {currentPeriod?.label}.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setAddEntryOpen(true)}>
                  <Plus className="size-4 mr-2" />
                  Ny verifikation
                </Button>
                <Button variant="outline" onClick={() => setSieImportOpen(true)}>
                  <Upload className="size-4 mr-2" />
                  Importera SIE
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journal entries table */}
        {!isLoading && entries && entries.length > 0 && (
          <>
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
                        onClick={() => setSelectedEntry(entry)}
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
            <TablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              itemLabel="verifikationer"
            />
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

      {/* Verification detail sheet */}
      <VerificationDetailSheet
        entry={selectedEntry}
        workspaceId={workspace.id}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />

      {/* SIE import dialog */}
      <SIEImportDialog
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        periods={periods}
        open={sieImportOpen}
        onOpenChange={setSieImportOpen}
        defaultPeriodId={currentPeriodId}
      />
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
      return "Leverantörsfaktura";
    case "lon":
      return "Lön";
    case "utlagg":
      return "Utlägg";
    case "opening_balance":
      return "Ingående balans";
    default:
      return "Annat";
  }
}
