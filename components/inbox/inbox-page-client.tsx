"use client";

import { Envelope, FunnelSimple, WarningCircle } from "@phosphor-icons/react";
import { useQueryState, parseAsInteger, parseAsStringLiteral } from "nuqs";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { InboxTable } from "./inbox-table";
import type { InboxEmailStatusValue } from "@/lib/validations/inbox";

type StatusFilter = InboxEmailStatusValue | "all";

const statusOptions = ["all", "pending", "processed", "rejected", "error", "archived"] as const;

const statusLabels: Record<StatusFilter, string> = {
  all: "Alla",
  pending: "Väntande",
  processed: "Behandlade",
  rejected: "Avvisade",
  error: "Fel",
  archived: "Arkiverade",
};

const DEFAULT_PAGE_SIZE = 20;

export function InboxPageClient() {
  const { workspace } = useWorkspace();
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsStringLiteral(statusOptions).withDefault("all")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));

  const { data, isLoading, error, refetch } = trpc.inbox.list.useQuery({
    workspaceId: workspace.id,
    status: statusFilter,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const emails = data?.emails;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Reset to page 1 when filter changes
  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const inboxEmail = workspace.inboxEmailSlug
    ? `${workspace.inboxEmailSlug}.${workspace.slug}@inbox.kvitty.se`
    : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inkorg</h1>
          {inboxEmail ? (
            <p className="text-muted-foreground">
              Skicka kvitton till{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                {inboxEmail}
              </code>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Konfigurera din inkorg i{" "}
              <a
                href={`/${workspace.slug}/installningar`}
                className="text-primary hover:underline"
              >
                inställningar
              </a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <FunnelSimple className="size-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) => handleFilterChange(value as StatusFilter)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue>{statusLabels[statusFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusLabels) as StatusFilter[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <WarningCircle className="size-12 mx-auto mb-4 text-destructive opacity-70" />
          <p className="text-lg font-medium text-destructive">
            Kunde inte hämta e-postmeddelanden
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error.message || "Ett oväntat fel uppstod"}
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Försök igen
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-8" />
        </div>
      ) : emails?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Envelope className="size-12 mx-auto mb-4 opacity-50" />
          {statusFilter === "all" ? (
            <>
              <p className="text-lg font-medium">Inga e-postmeddelanden ännu</p>
              {inboxEmail ? (
                <p className="mt-2">
                  Skicka ett e-postmeddelande med bilagor till{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                    {inboxEmail}
                  </code>
                </p>
              ) : (
                <p className="mt-2">
                  Konfigurera din inkorg i inställningarna för att komma igång
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-lg font-medium">
                Inga {statusLabels[statusFilter].toLowerCase()} e-postmeddelanden
              </p>
              <p className="mt-2">
                Prova att ändra filtret för att se fler meddelanden
              </p>
            </>
          )}
        </div>
      ) : emails ? (
        <InboxTable
          data={emails}
          workspaceId={workspace.id}
          workspaceMode={workspace.mode}
          hasFilters={statusFilter !== "all"}
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}
    </div>
  );
}
