"use client";

import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { createColumns, type BankTransaction } from "./bank-transaction-columns";
import { BankTransactionDetailSheet } from "./bank-transaction-detail-sheet";

interface BankTransactionsTableProps {
  data: BankTransaction[];
  workspaceId: string;
  workspaceSlug: string;
  hasFilters: boolean;
  initialSelectedId?: string;
  onSelectedIdHandled?: () => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function BankTransactionsTable({
  data,
  workspaceId,
  workspaceSlug,
  hasFilters,
  initialSelectedId,
  onSelectedIdHandled,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: BankTransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BankTransaction | null>(null);

  // Handle initial selected ID
  useEffect(() => {
    if (initialSelectedId && data.length > 0 && !selectedTransaction) {
      const transaction = data.find((t) => t.id === initialSelectedId);
      if (transaction) {
        setSelectedTransaction(transaction);
        onSelectedIdHandled?.();
      }
    }
  }, [initialSelectedId, data, selectedTransaction, onSelectedIdHandled]);

  const columns = useMemo(
    () => createColumns(setSelectedTransaction),
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <>
      <div className="bg-background rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedTransaction(row.original)}
                  className="cursor-pointer"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center px-4">
                  {hasFilters
                    ? "Inga transaktioner matchar din sökning."
                    : "Inga transaktioner hittades."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel="transaktioner"
      />

      <BankTransactionDetailSheet
        transaction={selectedTransaction}
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
      />
    </>
  );
}

