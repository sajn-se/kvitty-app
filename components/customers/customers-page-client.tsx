"use client";

import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { useWorkspace } from "@/components/workspace-provider";
import type { Customer } from "@/lib/db/schema";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomersTable } from "@/components/customers/customers-table";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";

const DEFAULT_PAGE_SIZE = 20;

export function CustomersPageClient() {
  const { workspace } = useWorkspace();
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [invoiceCustomerId, setInvoiceCustomerId] = useState<string | null>(null);
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState("pageSize", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE));
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.customers.list.useQuery({
    workspaceId: workspace.id,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const customers = data?.items;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const deleteCustomer = trpc.customers.delete.useMutation({
    onSuccess: () => utils.customers.list.invalidate(),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kunder</h1>
          <p className="text-muted-foreground">
            Hantera dina kunder för fakturering
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-2" />
          Ny kund
        </Button>
      </div>

      <CustomersTable
        customers={customers ?? []}
        onEdit={setEditingCustomer}
        onDelete={(customer) => {
          deleteCustomer.mutate({ workspaceId: workspace.id, id: customer.id });
        }}
        onCreateInvoice={(customer) => setInvoiceCustomerId(customer.id)}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
      />

      <CustomerFormDialog
        workspaceId={workspace.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
        customer={null}
      />

      <CustomerFormDialog
        workspaceId={workspace.id}
        open={!!editingCustomer}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        customer={editingCustomer}
      />

      <CreateInvoiceDialog
        workspaceId={workspace.id}
        open={!!invoiceCustomerId}
        onOpenChange={(open) => !open && setInvoiceCustomerId(null)}
        initialCustomerId={invoiceCustomerId || undefined}
      />
    </div>
  );
}

