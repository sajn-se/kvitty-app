"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { verifications } from "@/lib/db/schema";

export type Verification = typeof verifications.$inferSelect & {
  createdByUser: { id: string; name: string | null; email: string } | null;
};

export const createColumns = (
  onView: (verification: Verification) => void
): ColumnDef<Verification>[] => [
  {
    accessorKey: "office",
    header: "Konto",
    cell: ({ row }) => row.getValue("office") || "—",
  },
  {
    accessorKey: "accountingDate",
    header: "Bokföringsdag",
    cell: ({ row }) => {
      const value = row.getValue("accountingDate");
      return value || "—";
    },
  },
  {
    accessorKey: "reference",
    header: "Referens",
    cell: ({ row }) => row.getValue("reference") || "—",
  },
  {
    accessorKey: "amount",
    header: "Belopp",
    cell: ({ row }) => {
      const value = row.getValue("amount") as string | null;
      if (!value) return "—";
      const amount = parseFloat(value);
      return new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
      }).format(amount);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Skapad",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | null;
      if (!date) return "—";
      return new Intl.DateTimeFormat("sv-SE").format(new Date(date));
    },
  },
  {
    accessorKey: "createdByUser",
    header: "Skapad av",
    cell: ({ row }) => {
      const user = row.original.createdByUser;
      return user?.name || user?.email || "—";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onView(row.original);
        }}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
