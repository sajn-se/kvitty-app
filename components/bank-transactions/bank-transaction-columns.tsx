"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, File, FileX, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { bankTransactions } from "@/lib/db/schema";

export type BankTransaction = typeof bankTransactions.$inferSelect & {
  createdByUser: { id: string; name: string | null; email: string } | null;
  attachments?: { id: string }[];
  comments?: { id: string }[];
};

export const createColumns = (
  onView: (transaction: BankTransaction) => void
): ColumnDef<BankTransaction>[] => [
    {
      accessorKey: "accountNumber",
      header: "Konto",
      cell: ({ row }) => row.getValue("accountNumber") || "—",
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
        const d = new Date(date);
        // Format: date and hh:mm
        const dateString = new Intl.DateTimeFormat("sv-SE").format(d);
        const timeString = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
        return `${dateString} ${timeString}`;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const hasAttachments = (row.original.attachments?.length ?? 0) > 0;
        const attachmentCount = row.original.attachments?.length ?? 0;
        const hasComments = (row.original.comments?.length ?? 0) > 0;
        const commentCount = row.original.comments?.length ?? 0;
        return (
          <div className="flex items-center justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-7 w-7 items-center justify-center">
                  {hasAttachments ? (
                    <File className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileX className="h-4 w-4 text-muted-foreground/40" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {hasAttachments
                  ? `${attachmentCount} bilaga${attachmentCount > 1 ? "r" : ""}`
                  : "Inga bilagor"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-7 w-7 items-center justify-center">
                  <MessageCircle
                    className={`h-4 w-4 ${hasComments ? "text-muted-foreground" : "text-muted-foreground/40"}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {hasComments
                  ? `${commentCount} kommentar${commentCount > 1 ? "er" : ""}`
                  : "Inga kommentarer"}
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onView(row.original);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

