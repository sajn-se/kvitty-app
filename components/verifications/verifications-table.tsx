"use client";

import { useMemo, useState } from "react";
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
import { createColumns, type Verification } from "./verification-columns";
import { VerificationDetailSheet } from "./verification-detail-sheet";

interface VerificationsTableProps {
  data: Verification[];
  workspaceId: string;
  hasFilters: boolean;
}

export function VerificationsTable({
  data,
  workspaceId,
  hasFilters,
}: VerificationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);

  const columns = useMemo(
    () => createColumns(setSelectedVerification),
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
                  <TableHead key={header.id}>
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
                  onClick={() => setSelectedVerification(row.original)}
                  className="cursor-pointer"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {hasFilters
                    ? "Inga verifikationer matchar din sökning."
                    : "Inga verifikationer hittades."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <VerificationDetailSheet
        verification={selectedVerification}
        workspaceId={workspaceId}
        open={!!selectedVerification}
        onOpenChange={(open) => !open && setSelectedVerification(null)}
      />
    </>
  );
}
