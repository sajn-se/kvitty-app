"use client";

import Link from "next/link";
import { Pencil, Trash, DotsThree, Clock, Invoice } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TablePagination } from "@/components/ui/table-pagination";
import type { Customer, CustomerContact } from "@/lib/db/schema";
import { useWorkspace } from "@/components/workspace-provider";

type CustomerWithContacts = Customer & {
  contacts?: CustomerContact[];
};

interface CustomersTableProps {
  customers: CustomerWithContacts[];
  onEdit: (customer: CustomerWithContacts) => void;
  onDelete: (customer: CustomerWithContacts) => void;
  onCreateInvoice: (customer: CustomerWithContacts) => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
}

export function CustomersTable({
  customers,
  onEdit,
  onDelete,
  onCreateInvoice,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
}: CustomersTableProps) {
  const { workspace } = useWorkspace();

  return (
    <>
    <div className="bg-background rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4">Namn</TableHead>
          <TableHead className="px-4">Org.nr</TableHead>
          <TableHead className="px-4">Primär kontakt</TableHead>
          <TableHead className="px-4">E-post</TableHead>
          <TableHead className="px-4">Telefon</TableHead>
          <TableHead className="px-4">Ort</TableHead>
          <TableHead className="px-4 w-[140px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="px-4"><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell className="px-4"><Skeleton className="h-7 w-28" /></TableCell>
            </TableRow>
          ))
        ) : customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
              Inga kunder hittades.
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => {
            const primaryContact = customer.contacts?.[0];
            return (
            <TableRow key={customer.id}>
              <TableCell className="px-4 font-medium">{customer.name}</TableCell>
              <TableCell className="px-4 font-mono text-sm">{customer.orgNumber || "-"}</TableCell>
              <TableCell className="px-4">{primaryContact?.name || "-"}</TableCell>
              <TableCell className="px-4">{customer.email || "-"}</TableCell>
              <TableCell className="px-4">{customer.phone || "-"}</TableCell>
              <TableCell className="px-4">{customer.city || "-"}</TableCell>
              <TableCell className="px-4">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Visa fakturor"
                  >
                    <Link href={`/${workspace.slug}/fakturor?customerId=${customer.id}`}>
                      <Clock className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Skapa faktura"
                    onClick={() => onCreateInvoice(customer)}
                  >
                    <Invoice className="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <DotsThree className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Pencil className="size-4 mr-2" />
                        Redigera
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm("Är du säker på att du vill ta bort denna kund?")) {
                            onDelete(customer);
                          }
                        }}
                      >
                        <Trash className="size-4 mr-2" />
                        Ta bort
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
            );
          })
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
      itemLabel="kunder"
    />
    </>
  );
}

