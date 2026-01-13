"use client";

import { Pencil, Trash, DotsThree, Archive } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/ui/table-pagination";
import type { Product } from "@/lib/db/schema";
import { unitLabels, productTypeLabels } from "@/lib/validations/product";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kr";
}

export function ProductsTable({
  products,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ProductsTableProps) {
  return (
    <>
    <div className="bg-background rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4">Beskrivning</TableHead>
          <TableHead className="px-4">Enhet</TableHead>
          <TableHead className="px-4 text-right">Pris ex moms</TableHead>
          <TableHead className="px-4">Moms</TableHead>
          <TableHead className="px-4">Typ</TableHead>
          <TableHead className="px-4 w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className={!product.isActive ? "opacity-50" : ""}>
            <TableCell className="px-4 font-medium">
              <div className="flex items-center gap-2">
                {product.name}
                {!product.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    <Archive className="size-3 mr-1" />
                    Arkiverad
                  </Badge>
                )}
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground truncate max-w-xs">
                  {product.description}
                </p>
              )}
            </TableCell>
            <TableCell className="px-4">{unitLabels[product.unit]}</TableCell>
            <TableCell className="px-4 text-right font-mono">
              {formatCurrency(product.unitPrice)}
            </TableCell>
            <TableCell className="px-4">{product.vatRate} %</TableCell>
            <TableCell className="px-4">
              <Badge variant={product.type === "V" ? "default" : "secondary"}>
                {productTypeLabels[product.type]}
              </Badge>
            </TableCell>
            <TableCell className="px-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <DotsThree className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Pencil className="size-4 mr-2" />
                    Redigera
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      if (
                        confirm(
                          "Är du säker på att du vill ta bort denna produkt? Om produkten används på fakturor kommer den arkiveras istället."
                        )
                      ) {
                        onDelete(product);
                      }
                    }}
                  >
                    <Trash className="size-4 mr-2" />
                    Ta bort
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
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
      itemLabel="produkter"
    />
    </>
  );
}
