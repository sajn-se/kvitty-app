"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Swap, MagnifyingGlass, X, FunnelSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { BankTransactionsTable } from "@/components/bank-transactions/bank-transactions-table";
import { AddBankTransactionButton } from "@/components/bank-transactions/add-bank-transaction-button";

interface TransactionsPageClientProps {
  workspaceSlug: string;
  initialSearch: string;
  initialDateFrom: string;
  initialDateTo: string;
  initialBankAccountId: string;
  initialFilter: string;
  initialSelectedId?: string;
}

type QuickFilter = "all" | "last-month" | "last-3-months" | "last-year";

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
  initialSearch,
  initialDateFrom,
  initialDateTo,
  initialBankAccountId,
  initialFilter,
  initialSelectedId,
}: TransactionsPageClientProps) {
  const { workspace } = useWorkspace();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [bankAccountId, setBankAccountId] = useState(initialBankAccountId);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(
    (initialFilter as QuickFilter) || "all"
  );
  const [pendingSelectedId, setPendingSelectedId] = useState<string | undefined>(initialSelectedId);

  // Update URL params
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== initialSearch) {
        updateParams({ search: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, initialSearch, updateParams]);

  // Handle quick filter changes
  const handleQuickFilterChange = (filter: QuickFilter) => {
    setQuickFilter(filter);
    const { dateFrom: newDateFrom, dateTo: newDateTo } = getDateRangeForFilter(filter);
    setDateFrom(newDateFrom);
    setDateTo(newDateTo);
    updateParams({
      filter,
      dateFrom: newDateFrom || null,
      dateTo: newDateTo || null,
    });
  };

  // Handle custom date changes
  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setQuickFilter("all");
    updateParams({ dateFrom: value || null, filter: null });
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setQuickFilter("all");
    updateParams({ dateTo: value || null, filter: null });
  };

  // Handle bank account filter
  const handleBankAccountChange = (value: string) => {
    const newValue = value === "all" ? "" : value;
    setBankAccountId(newValue);
    updateParams({ bankAccountId: newValue || null });
  };

  // Fetch bank accounts for filter dropdown
  const { data: bankAccounts } = trpc.bankAccounts.list.useQuery({
    workspaceId: workspace.id,
  });

  // Fetch transactions
  const { data: transactions, isLoading } = trpc.bankTransactions.list.useQuery({
    workspaceId: workspace.id,
    bankAccountId: bankAccountId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Filter by search locally (API doesn't support search yet)
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (!searchInput) return transactions;

    const searchLower = searchInput.toLowerCase();
    return transactions.filter((t) => {
      return (
        t.reference?.toLowerCase().includes(searchLower) ||
        t.accountNumber?.toLowerCase().includes(searchLower) ||
        t.bankAccount?.name?.toLowerCase().includes(searchLower) ||
        t.bankAccount?.accountNumber?.toString().includes(searchLower)
      );
    });
  }, [transactions, searchInput]);

  const hasFilters = searchInput || dateFrom || dateTo || bankAccountId;

  const clearAllFilters = () => {
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setBankAccountId("");
    setQuickFilter("all");
    updateParams({
      search: null,
      dateFrom: null,
      dateTo: null,
      bankAccountId: null,
      filter: null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
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
                <BreadcrumbPage>Transaktioner</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Transaktioner</h1>
            <p className="text-muted-foreground text-sm">
              Alla banktransaktioner i bolaget
            </p>
          </div>
          <AddBankTransactionButton workspaceId={workspace.id} />
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
                  onClick={() => setSearchInput("")}
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
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Swap className="size-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
              <h3 className="font-medium mb-2">
                {hasFilters ? "Inga transaktioner matchar" : "Inga transaktioner"}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {hasFilters
                  ? "Prova att justera dina filter."
                  : "Importera eller skapa banktransaktioner for att komma igang."}
              </p>
              {!hasFilters && (
                <AddBankTransactionButton workspaceId={workspace.id} />
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Visar {filteredTransactions.length} transaktioner
            </div>
            <BankTransactionsTable
              data={filteredTransactions}
              workspaceId={workspace.id}
              workspaceSlug={workspaceSlug}
              hasFilters={!!hasFilters}
              initialSelectedId={pendingSelectedId}
              onSelectedIdHandled={() => {
                setPendingSelectedId(undefined);
                // Clear the selected param from URL
                updateParams({ selected: null });
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
