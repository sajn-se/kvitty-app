"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Plus, UserCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";
import { EmployeesTable } from "@/components/employees/employees-table";

const DEFAULT_PAGE_SIZE = 20;

interface PersonalPageClientProps {
  workspaceSlug: string;
}

export function PersonalPageClient({ workspaceSlug }: PersonalPageClientProps) {
  const { workspace } = useWorkspace();
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.employees.list.useQuery({
    workspaceId: workspace.id,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const employees = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const activeEmployeeCount = employees?.filter((e) => e.isActive).length ?? 0;
  const isAtLimit = activeEmployeeCount >= 25;

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
        currentPage="Personal"
      />

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Personal</h1>
            <p className="text-muted-foreground text-sm">
              Hantera anställda för lönekörningar
            </p>
          </div>
          <Button onClick={() => !isAtLimit && setAddOpen(true)} disabled={isAtLimit}>
            <Plus className="size-4 mr-2" />
            Lägg till anställd
          </Button>
        </div>

        {employees?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCircle className="size-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
              <h3 className="font-medium mb-2">Inga anställda</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Lägg till anställda för att kunna köra löner.
              </p>
              <Button onClick={() => !isAtLimit && setAddOpen(true)} disabled={isAtLimit}>
                <Plus className="size-4 mr-2" />
                Lägg till anställd
              </Button>
            </CardContent>
          </Card>
        ) : (
          <EmployeesTable
            employees={employees || []}
            workspaceSlug={workspaceSlug}
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <AddEmployeeDialog
          workspaceId={workspace.id}
          open={addOpen}
          onOpenChange={setAddOpen}
          isAtLimit={isAtLimit}
        />
      </div>
    </>
  );
}

