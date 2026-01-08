"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Plus, Money } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { CreatePayrollRunDialog } from "@/components/payroll/create-payroll-run-dialog";
import { PayrollRunsTable } from "@/components/payroll/payroll-runs-table";

interface PayrollPageClientProps {
  workspaceSlug: string;
}

const PAGE_SIZE = 20;

export function PayrollPageClient({ workspaceSlug }: PayrollPageClientProps) {
  const { workspace } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading } = trpc.payroll.listRuns.useQuery({
    workspaceId: workspace.id,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const runs = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    );
  }

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

      {runs?.length === 0 && page === 1 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Money className="size-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
            <h3 className="font-medium mb-2">Inga lönekörningar</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Skapa en lönekörning för att börja betala ut löner.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4 mr-2" />
              Ny lönekörning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <PayrollRunsTable
            runs={runs || []}
            workspaceSlug={workspaceSlug}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </Card>
      )}

      <CreatePayrollRunDialog
        workspaceId={workspace.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      </div>
    </>
  );
}

