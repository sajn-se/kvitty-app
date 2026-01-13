"use client";

import { useRouter } from "next/navigation";
import { useQueryState, parseAsInteger } from "nuqs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { TablePagination } from "@/components/ui/table-pagination";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { AccountTransactionsTable } from "@/components/bank/account-transactions-table";

const DEFAULT_PAGE_SIZE = 50;

interface AccountDetailClientProps {
  accountNumber: number;
  workspaceSlug: string;
}

export function AccountDetailClient({ accountNumber, workspaceSlug }: AccountDetailClientProps) {
  const router = useRouter();
  const { workspace } = useWorkspace();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const { data: account, isLoading: accountLoading } =
    trpc.bankAccounts.getByAccountNumber.useQuery({
      accountNumber,
      workspaceId: workspace.id,
    });

  const { data, isLoading: entriesLoading } =
    trpc.journalEntries.listByAccount.useQuery({
      accountNumber,
      workspaceId: workspace.id,
      limit: pageSize,
      offset: (page - 1) * pageSize,
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
  const totalPages = Math.ceil(total / pageSize);

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

        <TablePagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="transaktioner"
        />
      </div>
    </>
  );
}

