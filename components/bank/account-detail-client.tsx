"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { AccountTransactionsTable } from "@/components/bank/account-transactions-table";

const PAGE_SIZE = 50;

interface AccountDetailClientProps {
  accountNumber: number;
  workspaceSlug: string;
}

export function AccountDetailClient({ accountNumber, workspaceSlug }: AccountDetailClientProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;

  const { data: account, isLoading: accountLoading } =
    trpc.bankAccounts.getByAccountNumber.useQuery({
      accountNumber,
      workspaceId: workspace.id,
    });

  const { data, isLoading: entriesLoading } =
    trpc.journalEntries.listByAccount.useQuery({
      accountNumber,
      workspaceId: workspace.id,
      limit: PAGE_SIZE,
      offset,
    });

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Konto hittades inte</p>
        <Button variant="outline" onClick={() => router.push(`/${workspaceSlug}/bank`)}>
          Tillbaka till bankkonton
        </Button>
      </div>
    );
  }

  const entries = data?.entries || [];
  const total = data?.total || 0;
  const hasMore = data?.hasMore || false;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Bankkonton", href: `/${workspaceSlug}/bank` }]}
        currentPage={`${account.accountNumber} - ${account.name}`}
      />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {account.accountNumber} - {account.name}
          </h1>
          {account.description && (
            <p className="text-muted-foreground text-sm mt-1">{account.description}</p>
          )}
        </div>

        <AccountTransactionsTable
          entries={entries.map((item) => ({
            id: item.entry.id,
            entryDate: item.entry.entryDate,
            verificationNumber: item.entry.verificationNumber,
            description: item.entry.description,
            line: {
              id: item.line.id,
              description: item.line.description,
              debit: item.line.debit,
              credit: item.line.credit,
            },
          }))}
          isLoading={entriesLoading}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pb-6">
            <div className="text-sm text-muted-foreground">
              Visar {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} av {total} transaktioner
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || entriesLoading}
              >
                <CaretLeftIcon className="size-4" />
                Föregående
              </Button>
              <div className="text-sm text-muted-foreground">
                Sida {page + 1} av {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || entriesLoading}
              >
                Nästa
                <CaretRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

