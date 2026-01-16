"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import { useDebounce } from "@/hooks/use-debounce";
import { MagnifyingGlass, X, FunnelSimple, Upload, Paperclip } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { BankTransactionsTable } from "@/components/bank-transactions/bank-transactions-table";
import { AddBankTransactionButton } from "@/components/bank-transactions/add-bank-transaction-button";
import { CsvImportWizard } from "@/components/bank-transactions/csv-import-wizard";

interface TransactionsPageClientProps {
  workspaceSlug: string;
}

const DEFAULT_PAGE_SIZE = 20;

const quickFilterOptions = ["all", "last-month", "last-3-months", "last-year"] as const;
type QuickFilter = (typeof quickFilterOptions)[number];

const attachmentsFilterOptions = ["all", "with", "without"] as const;
type AttachmentsFilter = (typeof attachmentsFilterOptions)[number];

function getDateRangeForFilter(filter: QuickFilter): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (filter) {
    case "last-month": {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return { dateFrom: lastMonth.toISOString().split("T")[0], dateTo: today };
    }
    case "last-3-months": {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return { dateFrom: threeMonthsAgo.toISOString().split("T")[0], dateTo: today };
    }
    case "last-year": {
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return { dateFrom: lastYear.toISOString().split("T")[0], dateTo: today };
    }
    case "all":
    default:
      return { dateFrom: "", dateTo: "" };
  }
}

export function TransactionsPageClient({
  workspaceSlug,
}: TransactionsPageClientProps) {
  const { workspace } = useWorkspace();

  // URL state with nuqs
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [dateFrom, setDateFrom] = useQueryState("dateFrom", parseAsString.withDefault(""));
  const [dateTo, setDateTo] = useQueryState("dateTo", parseAsString.withDefault(""));
  const [bankAccountId, setBankAccountId] = useQueryState("bankAccountId", parseAsString.withDefault(""));
  const [quickFilter, setQuickFilter] = useQueryState(
    "filter",
    parseAsStringLiteral(quickFilterOptions).withDefault("all")
  );
  const [attachmentsFilter, setAttachmentsFilter] = useQueryState(
    "attachments",
    parseAsStringLiteral(attachmentsFilterOptions).withDefault("all")
  );
  const [selectedId, setSelectedId] = useQueryState("selected", parseAsString.withDefault(""));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));

  // CSV import wizard state
  const [csvImportOpen, setCsvImportOpen] = useState(false);

  // Debounced search input
  const [searchInput, setSearchInput] = useDebounce(search, setSearch, {
    onDebouncedChange: () => setPage(1),
    emptyAsNull: true,
  });

  // Handle quick filter changes
  const handleQuickFilterChange = (filter: QuickFilter) => {
    const { dateFrom: newDateFrom, dateTo: newDateTo } = getDateRangeForFilter(filter);
    setQuickFilter(filter);
    setDateFrom(newDateFrom || null);
    setDateTo(newDateTo || null);
    setPage(1);
  };

  // Handle custom date changes
  const handleDateFromChange = (value: string) => {
    setDateFrom(value || null);
    setQuickFilter("all");
    setPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value || null);
    setQuickFilter("all");
    setPage(1);
  };

  // Handle bank account filter
  const handleBankAccountChange = (value: string) => {
    const newValue = value === "all" ? null : value;
    setBankAccountId(newValue);
    setPage(1);
  };

  // Handle attachments filter
  const handleAttachmentsFilterChange = (value: AttachmentsFilter) => {
    setAttachmentsFilter(value === "all" ? null : value);
    setPage(1);
  };

  // Fetch bank accounts for filter dropdown
  const { data: bankAccounts } = trpc.bankAccounts.list.useQuery({
    workspaceId: workspace.id,
  });

  // Fetch transactions with server-side pagination and search
  const { data, isLoading } = trpc.bankTransactions.list.useQuery({
    workspaceId: workspace.id,
    bankAccountId: bankAccountId || undefined,
    hasAttachments: attachmentsFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: search || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const transactions = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const hasFilters = search || dateFrom || dateTo || bankAccountId || attachmentsFilter;

  const clearAllFilters = () => {
    setSearchInput("");
    setSearch(null);
    setDateFrom(null);
    setDateTo(null);
    setBankAccountId(null);
    setAttachmentsFilter(null);
    setQuickFilter("all");
    setPage(1);
  };

  return (
    <>
      <PageHeader currentPage="Transaktioner" />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transaktioner</h1>
            <p className="text-muted-foreground text-sm">
              Alla banktransaktioner i bolaget
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
              <Upload className="size-4 mr-2" />
              Importera CSV
            </Button>
            <AddBankTransactionButton workspaceId={workspace.id} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          {/* Quick filters */}
          <div className="flex flex-wrap items-center gap-2">
            <FunnelSimple className="size-4 text-muted-foreground" />
            <Button
              variant={quickFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilterChange("all")}
            >
              Alla
            </Button>
            <Button
              variant={quickFilter === "last-month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilterChange("last-month")}
            >
              Senaste månaden
            </Button>
            <Button
              variant={quickFilter === "last-3-months" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilterChange("last-3-months")}
            >
              Senaste 3 månader
            </Button>
            <Button
              variant={quickFilter === "last-year" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleQuickFilterChange("last-year")}
            >
              Senaste året
            </Button>
          </div>

          {/* Search and detailed filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Sök referens, beskrivning..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 pr-8"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 size-7"
                  onClick={() => {
                    setSearchInput("");
                    setSearch(null);
                  }}
                >
                  <X className="size-3" />
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="hidden sm:block" />

            <Select
              value={bankAccountId || "all"}
              onValueChange={handleBankAccountChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alla konton" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla konton</SelectItem>
                {bankAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountNumber} - {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={attachmentsFilter || "all"}
              onValueChange={(v) => handleAttachmentsFilterChange(v as AttachmentsFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <Paperclip className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Bilagor" />
              </SelectTrigger>
              <SelectContent className="align-start">
                <SelectItem value="all">Alla</SelectItem>
                <SelectItem value="with">Med bilagor</SelectItem>
                <SelectItem value="without">Inga bilagor</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              value={dateFrom}
              onChange={handleDateFromChange}
              placeholder="Från datum"
            />
            <DatePicker
              value={dateTo}
              onChange={handleDateToChange}
              placeholder="Till datum"
            />

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="self-start sm:self-center"
              >
                Rensa filter
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <BankTransactionsTable
          data={transactions}
          workspaceId={workspace.id}
          workspaceSlug={workspaceSlug}
          hasFilters={!!hasFilters}
          initialSelectedId={selectedId || undefined}
          onSelectedIdHandled={() => setSelectedId(null)}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      </div>

      {/* CSV Import Wizard */}
      <CsvImportWizard
        workspaceId={workspace.id}
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
      />
    </>
  );
}
