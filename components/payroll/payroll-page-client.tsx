"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { CreatePayrollRunDialog } from "@/components/payroll/create-payroll-run-dialog";
import { PayrollRunsTable } from "@/components/payroll/payroll-runs-table";

interface PayrollPageClientProps {
  workspaceSlug: string;
}

const DEFAULT_PAGE_SIZE = 20;

export function PayrollPageClient({ workspaceSlug }: PayrollPageClientProps) {
  const { workspace } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));

  const { data, isLoading } = trpc.payroll.listRuns.useQuery({
    workspaceId: workspace.id,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const runs = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        breadcrumbs={[{ label: "Personal", href: `/${workspaceSlug}/personal` }]}
        currentPage="Lönekörningar"
      />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Lönekörningar</h1>
            <p className="text-muted-foreground text-sm">
              Hantera löner och generera arbetsgivardeklarationer
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4 mr-2" />
            Ny lönekörning
          </Button>
        </div>

        <Card>
          <PayrollRunsTable
            runs={runs ?? []}
            workspaceSlug={workspaceSlug}
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </Card>

      <CreatePayrollRunDialog
        workspaceId={workspace.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      </div>
    </>
  );
}

